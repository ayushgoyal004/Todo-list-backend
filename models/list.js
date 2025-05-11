const mongoose=require("mongoose");
const listSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true,
    },
    body:{
        type:String,
        required:true,
    },
    due_date:{
        type: Date,
        required:false
    },
    isCompleted: {
    type: Boolean,
    default: false,
    },
    user:[{
        type: mongoose.Types.ObjectId,
        ref:"User",
    },
],
},
    {timestamps:true}
);


module.exports=mongoose.model("List",listSchema);