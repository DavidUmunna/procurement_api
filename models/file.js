const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    
   files:[ {email:{type:String,},
    storedName: {
        type: String,
        default: function () {
            return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        },
    } ,
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model("File", fileSchema);
