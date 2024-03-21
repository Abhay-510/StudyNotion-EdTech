const cloudinary = require("cloudinary").v2; //! Cloudinary is being required

exports.cloudinaryConnect =()=>{
    try {
        cloudinary.config({ 
            cloud_name: process.env.CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API, 
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
    } catch (error) {
        console.log(error);
    }
}
          


