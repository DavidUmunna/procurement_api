const crypto=require("crypto")

const CSRF_SECRET=crypto.randomBytes(32).toString("hex")


function generateCSRFToken(userId){
    
    const iv=crypto.randomBytes(15)
    const cipher=crypto.createCipheriv("aes-256-ocb",
        Buffer.from(CSRF_SECRET,"hex"),iv,{authTagLength:16});
    
    const data = `${userId}|${Date.now()}`;
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag=cipher.getAuthTag().toString('hex')
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;

}

function verifyCSRFToken(token) {
  try {
    console.log(token)
    const [ivHex,authTagHex ,encryptedData] = token.split('%3A');
    console.log(ivHex,authTagHex,encryptedData)
    const iv = Buffer.from(ivHex, 'hex');
    console.log("initialization vector",iv)
    const authTag=Buffer.from(authTagHex,'hex')
    const decipher = crypto.createDecipheriv('aes-256-ocb', 
      Buffer.from(CSRF_SECRET,"hex"), 
      iv,{authTagLength:16}
    );
    console.log("the decipher",decipher)
    
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const [userId, timestamp] = decrypted.split('|');
    const tokenAge = Date.now() - parseInt(timestamp);
    
    return {
      isValid: tokenAge < 3600000, // 1 hour expiry
      userId
    };
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return { isValid: false };
  }
}

module.exports={generateCSRFToken,verifyCSRFToken}