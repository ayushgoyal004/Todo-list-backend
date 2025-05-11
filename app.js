require("dotenv").config();
const express=require('express')
const app=express()

require("./connection/connection");
const auth=require('./routes/auth');
const list=require("./routes/list");
const List = require("./models/list");
app.use(express.json());

app.get("/",(req,res) => {
 res.send("Hello");
});


app.use('/api/v1',auth)
app.use('/api/v1',list)


app.listen(1000,() => {
    console.log("Server started");
});


setInterval(async () =>{
    try{
        const now=new Date();
        const start=new Date(now.setHours(0,0,0,0));
        const end=new Date(now.setHours(23,59,59,999));

        const dueTasks=await List.find({
            due_date: {$gte: start,$lte:end},
            isCompleted:false
        });
        if(dueTasks.length>0){
            dueTasks.forEach(task => {
                console.log(`Reminder: Task "${task.title}" is due today.`);
            });}
        else{
            console.log("No task due today");
        }
    } catch(error){
        console.error("Error checking due tasks: ",error.message);
    }
},60*1000);