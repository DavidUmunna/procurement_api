const express=require('express')
const Task=require("../models/tasks")
const auth=require('../middlewares/check-auth')
const router=express.Router()

router.post('/', auth, async (req, res) => {
    try {
      const task = new Task({
        ...req.body,
        
      });
      await task.save();
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      console.error("error from tasks:",err)
      res.status(500).json({ success: false, message: 'Error creating task' });
    }
  });
  
router.get('/', auth, async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate('assignedTo', )
        .populate('department' );
      res.json({ success: true, data: tasks });
    } catch (err) {
      console.log(err)
      res.status(500).json({ success: false, message: 'Error fetching tasks' });
    }
  });
  router.get('/:id', auth, async (req, res) => {
    try {
      const id=req.params.id
      const tasks = await Task.find({assignedTo:id})
        .populate('assignedTo',"name" )
        .populate('department',"name" );
      console.log("user gettiing task",tasks)
      res.json({ success: true, data: tasks });
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: 'Error fetching tasks' });
    }
  });
  router.patch('/:id', auth, async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      ).populate('department assignedTo');
      
      res.json({ success: true, data: task });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });
  router.delete('/:id',async(req,res)=>{
    try{
      const id=req.params.id
      const deletedtask=await Task.findByIdAndDelete(id)
      if (!deletedtask){
        return res.status(404).json({message:"task not found"})
      }
      res.status(200).json({message:"task deleted successfully"})



    }catch(err){
      console.error("error from delete task",err)
      res.status(500).json({message:'error deleting task'})
    }
  })

module.exports=router;