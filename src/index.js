// import dotenv from "dotenv"
require("dotenv").config()
const connectDB = require("./db/index.js");
const app = require('./app.js');
// import { app } from './app.js'
// dotenv.config({
//     path: './.env'
// })

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
        
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })


// (async () => {

//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("app is not able to talk to the database ");
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log("app is listen on port no ",process.env.PORT);
//         })

//     } catch (error) {
//            console.log("error occurs",error);
//     }

// })()