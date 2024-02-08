const mongoose = require('mongoose')

const { DB_NAME } = require("../constant");


const connectDB = async () => {
    try {

        const connectionString = `mongodb://localhost:27017/${DB_NAME}`;
        const connectionInstance = await mongoose.connect(connectionString)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

module.exports = connectDB;

