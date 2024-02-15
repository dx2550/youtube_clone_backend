const apiErrors = require("../utils/apiErrors");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken")
const User = require("../models/user.model");

const verifyJWT = asyncHandler(async (req, _, next) => {
    console.log("requets is ", req.cookies);
    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        console.log("token is ", token );
        // const tokenFromHeader = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new apiErrors(401, " Unauthorized Access ")
        }
        // if (!token || typeof token !== "string") {
        //     throw new apiErrors(401, "Unauthorized Access");
        // }

        const decodedTOken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        console.log("Decoded Token:", decodedTOken);

        const user = await User.findById(decodedTOken?._id).select("-password -refreshToken")

        if (!user) {
            throw new apiErrors(401, " Invalid Token ACCESS ")
        }

        req.user = user;
        next()

    } catch (error) {
        console.log("error", error);
        throw new apiErrors(401, error?.message || " Invalid Token ACCESS ")

    }
})

module.exports = verifyJWT;