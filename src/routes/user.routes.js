const express = require("express");
const { registerUser, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getChannelProfile, getWatchHistory } = require("../controllers/user.controller.js");
const { loginUser } = require("../controllers/user.controller.js")
const { logOutUser } = require("../controllers/user.controller.js")
const { refreshAccessToken } = require("../controllers/user.controller.js")
const router = express.Router();

const upload = require("../middlewares/multer.middleware.js");
const verifyJWT = require("../middlewares/auth.middleware.js");


router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverimage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route('/login').post(loginUser)

// secured routes 


router.route("/logOutUser").post(verifyJWT, logOutUser)

router.route("/refresh-token").post(refreshAccessToken, logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverimage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

module.exports = router;