const asyncHandler = require("../utils/asyncHandler.js")
const apiErrors = require("../utils/apiErrors.js");
const { fields } = require("../middlewares/multer.middleware.js");
const User = require("../models/user.model.js");
const { error } = require("console");
const uploadOnCloudinary = require("../utils/cloudinary.js")
const ApiResponse = require("../utils/ApiResponse.js")
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const generateAccessAndRefreshToken = async (userID) => {
    try {
        console.log("called");

        const user = await User.findById(userID)

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {

        throw new apiErrors(500, "Something went wrong in refresh and access token")

    }
}

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

    const existedUSer = await User.findOne({
        $or: [{ username }, { email }]

    })

    if (existedUSer) {
        throw new apiErrors(409, "user name or email already exists")
    }

    const avatarlocalfilepath = req.files?.avatar[0]?.path
    // const coverImagelocalfilePath = req.files?.coverimage[0]?.path
    //const coverImagelocalfilePath = req.files?.coverImage[0]?.path;

    let coverImagelocalfilePath;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverImagelocalfilePath = req.files.coverimage[0].path
    }





    if (!avatarlocalfilepath) {
        throw new apiErrors(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarlocalfilepath)
    const coverimg = await uploadOnCloudinary(coverImagelocalfilePath)

    console.log("avarar.....", avatar);
    if (!avatar) {
        throw new apiErrors(400, "Avatar file is required")

    }


    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverimage: coverimg?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findOne(user._id).select(" -password -refreshToken")

    if (!createdUser) {
        throw new apiErrors(500, "something went wrong while registring the user")
    }

    return res.status(201)
        .clearCookie('refreshToken')
        .clearCookie('accessToken')
        .clearCookie('refrreshtoken')
        .clearCookie('accesstoken')
        .clearCookie('refreshtoken').json(

            new ApiResponse(200, createdUser, "User Registered Successfully")
        )

})


const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body


    if (!username && !email) {
        throw new apiErrors(400, " email or username is required ")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new apiErrors(404, "user does not exists")
    }
    // console.log("user", user);
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new apiErrors(404, "password is not matched")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    console.log("acc", typeof accessToken, "ref", refreshToken);
    const logginUser = await User.findById(user._id).select("-password -refreshToken")


    return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .json(
            new ApiResponse(200,
                {
                    user: logginUser, accessToken, refreshToken
                }, "Userr loggin successfully"))
})


const logOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: 1
            }

        }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true,
    }


    return res.status(200).clearCookie("accessToken", options).clearCookie("refrreshToken", options).json(new ApiResponse(200, {}, "User Loggedout successfull"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incommingRefreshToken) {
        throw new apiErrors(401, "Unauthorized Token access")
    }


    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)


        const user = await User.findById(decodedToken._id)

        if (!user) {

            throw new apiErrors(401, "invlid refresh token ")

        }

        if (incommingRefreshToken !== user?.refreshToken) {
            throw new apiErrors(401, "REfresh token is expired or used ")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(new ApiResponse(
                200, { accessToken, refreshToken: newrefreshToken },
                "Access Token Refresh Successfully"
            ))
    } catch (error) {
        throw new apiErrors(401, error?.message || "Invalid refresh TOken ")
    }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiErrors(400, "invalid old password ")
    }


    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully "))
})


const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200)
        .json(new ApiResponse(200, res.user, " Current user fetch successfully"))

})


const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new apiErrors(400, "All fields are required")
    }


    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:
            {
                fullname,
                email
            }
        }, { new: true }).select("-password ")


    res.status(200).json(new ApiResponse(200, user, "user deatils updated successfully"))
})


const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatsrLocalFilePath = req.files?.path

    if (!avatsrLocalFilePath) {
        throw new apiErrors(400, "Avatar File is missing")
    }

    const avatar = await uploadOnCloudinary(avatsrLocalFilePath)

    if (!avatar.url) {
        throw new apiErrors(400, "Error while uploading the avatar on cloudinary")

    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: avatar.url
        }

    }, {
        new: true
    }).select("-password")


    return res.status(200).json(new ApiResponse(200, user, "avatar updated successfully"))
})


const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalFilePath = req.files?.path

    if (!coverImageLocalFilePath) {
        throw new apiErrors(400, "coverimage  File is missing")
    }

    const coverimage = await uploadOnCloudinary(coverImageLocalFilePath)

    if (!coverimage.url) {
        throw new apiErrors(400, "Error while uploading the coverimage on cloudinary")

    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            coverimage: coverimage.url
        }

    }, {
        new: true
    }).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "coverimage updated successfully"))

})


const getChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.parms

    if (!username) {
        throw new apiErrors(400, "username is missing ")
    }


    // const user = await User.find(username)
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo'"

            }
        }, {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"

                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        }, 
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverimage: 1,
                email: 1,
            }
        }



    ])


    if (!channel?.length) {
        throw new apiErrors(404, "channel does not exists")

    }

    return res.status(200).json(new ApiResponse(200, channel[0], " user channel data fetched successfully "))



})



const getWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.aggregate([

        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        }, {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [{
                                $project: {
                                    fullname: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }]

                        },
                    }, {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }

                ]
            }
        }
    ])


    return res.status(200).json(new ApiResponse(200, user[0].watchHistory), " Watch History Fetched ")

})

module.exports = {
    registerUser,
    loginUser,
    logOutUser,
    generateAccessAndRefreshToken,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getChannelProfile,
    getWatchHistory
};