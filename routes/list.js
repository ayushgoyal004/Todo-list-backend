const router=require("express").Router()
const verifyToken=require("../middleware/verifyToken")
const User= require("../models/user")
const List=require("../models/list");

const mongoose = require("mongoose");


//Create
router.post("/addTask",verifyToken,async(req,res)=>{
    try{
        const {title,due_date,body,isCompleted} = req.body;
        const {username}=req.user;
        const existingUser=await User.findOne({username});
        if(existingUser){
            const list=new List({title,body,due_date,isCompleted,user:existingUser});
            await list.save().then(()=> res.status(200).json({list}));
            existingUser.list.push(list);
            existingUser.save();
            res.status(200).json({ list });
        }
    }
    catch(error){
        console.log(error); 
    }
});


//Update
router.put("/updateTask/:id",verifyToken,async(req,res)=>{
    try{
        const { title, due_date, body, isCompleted } = req.body;
        const task = await List.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { title, due_date, body,isCompleted },
            { new: true }
        );
        if(!task){
            return res.status(403).json({message:"You are not authorized to update this task"});
        }   
        res.status(200).json({message:"Task updated successfully"});
    }
    catch(error){
        console.log(error);
        res.status(400).json({message:"Updation error"})
    }
});


//Delete
router.delete("/deleteTask/:id",verifyToken,async(req,res) =>{
    try{
        const {username}=req.body;
        const existingUser=await User.findOneAndUpdate(
            {username},
            {$pull: {list: req.params.id}}
        );
        if(existingUser){
            const list=await List.findByIdAndDelete(req.params.id).then(()=>
                res.status(200).json({message:`Task deleted succesfully with id ${req.params.id}`})
            );
        }
    }
    catch(error){
        console.log(error)
        res.status(400).json({message:"Error in deleting the task"})
    }
});



//get all tasks
router.get("/getTasks/:id",verifyToken,async(req,res) =>{
    const list =await List.find({user:req.params.id});
    if(list.length!=0){
        res.status(200).json({list:list});
    }
    else{
        res.status(400).json({message:"No tasks available for this user"})
    }
});


//Get task by Id
router.get("/getTaskById/:id",verifyToken,async(req,res) =>{
    try{
        // const list=await List.findById(req.params.id);
        const list=await List.findOne({
            _id:req.params.id,
            user:req.user.id
        })

    if(list!=0){
        res.status(200).json({list:list});
    }
    else{
        res.status(400).json({message:"No task available with this id"});
    }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


//Marking task as complete or incomplete
router.patch("/toggleComplete/:id",verifyToken,async(req,res)=>{
    try{
        const task=await List.findOne({_id:req.params.id,user:req.user.id});
    if(!task){
        return res.status(403).json({message:"You are not authorized to update this task status"});
    }
    task.isCompleted = !task.isCompleted;
    await task.save();
    res.status(200).json({message:`Task marked as ${task.isCompleted ? 'completed' : 'incomplete'}`,task});
    } catch(error){
        console.log(error);
        res.status(400).json({message:"Error toggling task status"});
    }
});


//Grouping by due date
router.get("/groupByDueDate", verifyToken, async (req, res) => {
    try {
        const tasks = await List.aggregate([
            {
                $match: {
                    user: mongoose.Types.ObjectId(req.user.id),
                    // user:req.user.id,
                    due_date: { $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$due_date" }
                    },
                    tasks: { $push: "$$ROOT" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        res.status(200).json({ groupedByDueDate: tasks });
    } catch (err) {
        console.error("Aggregation error:", err);
        res.status(500).json({ message: "Error grouping tasks by due date", error: err.message });
    }
});


module.exports=router;