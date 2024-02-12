const express = require("express");
const registerUser = require("../controllers/user.controller.js");
const router = express.Router();

const upload = require("../middlewares/multer.middleware.js")


router.route('/register').post(
    
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser)



module.exports = router;