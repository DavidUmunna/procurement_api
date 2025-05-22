const Activity = require('../models/Activity');
const express=require('express')
const { getPagination, getPagingData } = require('../controllers/pagination');
const router=express.Router()


router.get("/",async(req,res)=>{
    try{
        const { page, limit, skip } = getPagination(req);
        const query = {};
    
    // Example filter by action type
    if (req.query.action) {
      query.action = req.query.action;
    }
    
    // Example date range filter
    if (req.query.startDate && req.query.endDate) {
      query.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    const [total, activities] = await Promise.all([
        Activity.countDocuments(query),
        Activity.find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .populate('itemId', 'name category')
      ]);
        
        res.json({ data: activities,
        pagination:getPagingData(total, page, limit)
        });
    }catch(error){
        console.error("originated from activity route",error)
        res.status(500).json({ error: err.message });

    }
})





module.exports=router