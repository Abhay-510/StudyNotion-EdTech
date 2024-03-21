const User= require("../models/User");
const mailSender= require("../utils/mailSender");
const bcrypt= require("bcrypt");
const crypto= require("crypto");

//resetPasswordToken

exports.resetPasswordToken= async(req,res)=>{
    //xtract email from req body
   try{
        const email= req.body.email;

        //verify user for email
        const user= await User.findOne({email:email});

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Email not registered"
            });
        }
        //generate token
        const token = crypto.randomBytes(20).toString("hex");
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email:email},
                                                            {token:token,
                                                             resetPasswordExpiry:Date.now() + 5*60*1000},
                                                            {new:true});
        //create url

        const url= `https://localhost:3000/update-password/${token}`;
        //send mail containg url
        await mailSender(email,
                        "password reset Link",
                        `Password Reset Link: ${url}`
        )
        //return response
            return res.json({
                success:true,
                message:"Email sent successfully . Please check your mail"
            });
   }
   catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"something went wrong while sending reset password link"
    });
   }
    
}

//reset Password
exports.resetPassword= async(req,res)=>{
    try {
            //fetch data

        const{password,token,confirmPassword}= req.body;
        //validaion
        if(password!==confirmPassword){
            return res.json({
                success:false,
                message:"password not matching"
            })
        }
        //get user details from db using token
        const user= User.findOne({token:token});
        //if no entry then invalid token
        if(!user){
            return res.json({
                success:false,
                message:"Invalid token"
            })
        }
        //check token expiry

        if(user.resetPasswordExpiry<Date.now()){
            return res.json({
                success:false,
                message:"Token expired,generate new token"
            })
        }
        //hash password
        const hashedPassword= await bcrypt.hash(password,10);
        //update pass in user
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        );
        //return response
            return res.status(200).json({
                success:true,
                message:"password reset successfull"
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in password reset"
        });
    }

}