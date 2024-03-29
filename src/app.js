// import express from "express";
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "64kb" }))
app.use(express.urlencoded({ extended: true, limit: "64kb" }))
app.use(express.static("public"))
app.use(cookieParser())

///import routes 
const userRoutes = require('./routes/user.routes.js')



//declare routes 
app.use("/api/v1/users",userRoutes)


module.exports = app;