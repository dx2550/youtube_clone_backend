const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },

    avatar: {
        type: String, ///it is used for storing avtar images in cloudnary
        required: true,
    },

    coverimage: {
        type: String, ///it is used for storing cover images in cloudnary
        required: true,
    },

    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }

    ],

    password: {
        type: String,
        required: [true, "Passwrod is required"],

    },

    refreshToken: {
        type: String,
    }

}, { timestamps: true })


userSchema.pre("save", async function (next) {
    
    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = async function () {

    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
    }, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        })

}
userSchema.methods.generateRefreshToken = async function () {


    return jwt.sign({

        _id: this._id,


    }, process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        })
}



const User = mongoose.model("User", userSchema);

module.exports = User