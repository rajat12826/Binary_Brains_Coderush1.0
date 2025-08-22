import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose';
import cors from 'cors'
import express from 'express'

import connectCloudinary from './config/cloudinary.js';


const app = express();
app.use(cors())


mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Connected To MongoDB");
})
.catch((err)=>{
    console.log(err)
})

connectCloudinary()

app.use(express.json())





app.use((err,req,res,next)=>{
    const statusCode=err.statusCode || 500
    const message=err.message || "Internal Server Error"

    res.status(statusCode).json({
        success:false,
        status:statusCode,
        message:message
    })
})

app.get("/", (req, res) => {
  res.send("Backend is working!");
});



    



app.listen(8000,()=>{
    console.log("server started on port 8000")
});