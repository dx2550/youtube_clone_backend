const asyncHandler = require("../utils/asyncHandler.js")
const apiErrors = require("../utils/apiErrors.js");
const { fields } = require("../middlewares/multer.middleware.js");
const User = require("../models/user.model.js");
const { error } = require("console");
const uploadOnCloudinary = require("../utils/cloudinary.js")
const ApiResponse = require("../utils/ApiResponse.js")

const registerUser = asyncHandler(async (req, res) => {

    // res.status(200).json({
    //     message: "OK"
    // })

    const { fullname, username, email, password } = req.body;

    if (
        [fullname, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new apiErrors(400, All)
    }

    const existedUSer = User.findOne({
        $or: [{ username }, { email }]

    })

    if (existedUSer) {
        throw new apiErrors(409, "user name or email already exists")
    }

    const avatarlocalfilepath = req.files?.avatar[0]?.path
    const coverImagelocalfilePath = req.files?.coverimage[0]?.path

    if (!avatarfilepath) {
        throw new apiErrors(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarlocalfilepath)
    const coverimg = await uploadOnCloudinary(coverImagelocalfilePath)

    if (!avatar) {
        throw new apiErrors(400, "Avatar file is required")

    }


    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverimg: coverimg?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findOne(user._id).select(" -password -refreshToken")

    if (!createdUser) {
        throw new apiErrors(500, "something went wrong while registring the user")
    }

    return res.status(201).json(

        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

})


module.exports = registerUser;