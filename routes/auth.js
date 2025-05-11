const router= require("express").Router();
const bcrypt=require("bcryptjs")
const User= require("../models/user");
const jwt=require("jsonwebtoken");

//SIGN UP
router.post("/register", async (req,res) => {
    try{
        const{email,username,password} = req.body;
        const hashPassword=bcrypt.hashSync(password);
        const user=new User({ email,username,password:hashPassword });
        await user.save().then(()=>
            res.status(200).json({user:user})); 
    }
    catch(error){
        console.log(error);
        res.status(400).json({message: "User already exist"});
    }
});


// LOGIN/SIGN IN
router.post("/login",async(req,res) =>{
    try{
        const user=await User.findOne({username:req.body.username});
        if(!user){
            res.status(400).json({message:"User does not exist,Please sign up first"});
        }
        const isPasswordCorrect=bcrypt.compareSync(req.body.password, user.password);
        if(!isPasswordCorrect){
            res.status(400).json({message: "Wrong password entered"});
        }
        //Adding JWT
        const token=jwt.sign(
            {id:user._id,username:user.username},
            process.env.JWT_SECRET,
            {expiresIn: "1d" }
        );
        const {password,...others}=user._doc;
        res.status(200).json({token,user:others});
    }
    catch(error){
        res.status(400).json({message:"Invalid username or password"});
    }
});

// LOGOUT
router.post("/logout", (req, res) => {
    // To logout, simply remove the token from the client-side.
    // On server-side, we don't need to do anything as it's stateless, but we inform the client.
    res.status(200).json({message: "You have been logged out successfully."});
});


module.exports=router;