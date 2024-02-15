const express = require("express");
const { registerUser } = require("../controllers/user.controller.js");
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

module.exports = router;