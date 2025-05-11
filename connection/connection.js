const mongoose = require('mongoose');
const connection=async(req , res) => {
    try{
        await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MONGODB Connected")
    });
    } catch(error){
        res.status(400).json({
            message:"Not connected",
        });
    }
};
connection();

