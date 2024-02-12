const cloudinary = require('cloudinary').v2


// import { v2 as cloudinary } from 'cloudinary';
const fs = require('fs')

const uploadOnCloudinary = async (localfilepath) => {
    try {
        // console.log("localfile pat",localfilepath);
        if (!localfilepath) return null

        ///upload file on cloudinary

        const resposne = await cloudinary.uploader.upload(localfilepath, {
            resource_type: 'auto'
        })

        // console.log("clounary res", resposne);


        // file uploaded successfullly
        // console.log("file uploaded on clouinary ", resposne.url);

        fs.unlinkSync(localfilepath)
        return resposne
    } catch (error) {
        console.log("error........................", error);
        fs.unlinkSync(localfilepath)
        // it removes the locally saved temporary file 

        return null
    }

}

module.exports = uploadOnCloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});