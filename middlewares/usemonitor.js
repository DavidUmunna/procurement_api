const express=require('express')
const notifications=require('../controllers/notification')


const router = express.Router();
const endpointHits = {};

router.use((req, res, next) => {
  const path = req.path;
  endpointHits[path] = (endpointHits[path] || 0) + 1;
  console.log(`${path} has been hit ${endpointHits[path]} times`);
  const hits=endpointHits[path]
  if (hits===5){
        
       notifications(hits)
       endpointHits[path]=0

  }
  
  
  next();
});

module.exports=router;
