const RatingAndReview= require("../models/RatingAndReview");
const Course= require("../models/Course");
const {mongoose } = require("mongoose");

// create rating

exports.createRating = async(req,res)=>{
    try{
        //fetch user id
        const userId= req.user.id;
        // fetch data from req body
        const {rating,review,courseId}= req.body;

        //check if user is enrolled or not
        const courseDetails= await Course.findOne(
                                            {
                                                _id:courseId,
                                                studentsEnrolled: { $elemMatch:{$eq:userId} }
                                            });
        if(!courseDetails){
            return res.status(403).json({
                success:false,
                message:"Student is not enrolled in this course",
            });
        }
        //check if already reviewed the course or not
        const alreadyReviewed= await RatingAndReview.findOne(
                                                {
                                                    user:userId,
                                                    course:courseId,
                                                });
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Student has already rated and reviewed the course",
            });
        }
        // create rating and review
        const ratingReview= await RatingAndReview.create({
                                        rating,
                                        review,
                                        course:courseId,
                                        user:userId,
        });
        //update review id into course schema
        const updatedCourseDetails= await Course.findByIdAndUpdate({_id:courseId},
                                                            {
                                                                $push:{
                                                                    ratingAndReview:ratingReview._id,
                                                                }
                                                            },
                                                            {new:true});
        //return response
        console.log(updatedCourseDetails);

        return res.status(200).json({
            success:true,
            message:"Rating and review created successfully",
            ratingReview,
        })

    }
    catch(error){
        return res.status(500).json({
                success:false,
                message:error.message,
        });
    }
}
// get average rating

exports.getAverageRating= async(req,res)=>{
    try{
        //get course id
        const courseId= req.body.courseId;

        //db call -->cal avg rating

        const result= await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg : "rating"},
                }
            }
        ]);
        //return rating

        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            });
        }
        else{
            return res.status(200).json({
                success:true,
                message:"Average rating is 0,No ratings given till now",
                averageRating:0,
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//get all rating and reviews

exports.getAllRatingReview= async(req,res)=>{
    try{
        const allReviews= await RatingAndReview.find({})
                                                .sort({rating:"desc"})
                                                .populate({
                                                    path:"user",
                                                    select:"firstName lastName email image"
                                                })
                                                .populate({
                                                    path:"course",
                                                    select:"courseName"
                                                })
                                                .exec();
        return res.status(200).json({
            success:true,
            data:allReviews
        });    
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}