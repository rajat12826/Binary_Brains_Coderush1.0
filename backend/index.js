// src/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { existsSync, mkdirSync } from "fs";
// import pino from "pino";
// import pinoHttp from "pino-http";
// import "express-async-errors";
import submissionsRouter from "./routes/submissions.js";

import { initCloudinary } from "./config/cloudinary.js";

// const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const app = express();
// app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Ensure upload dir exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

// Connect MongoDB
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI not set in .env");
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
  .then(()=> console.log("Connected to MongoDB"))
  .catch(err => {
    console.log("Mongo connection error", err);
    process.exit(1);
  });

// Init Cloudinary
initCloudinary();

app.get("/", (_req,res)=>res.send("Backend running"));
app.use("/api/submissions", submissionsRouter);

app.use((err, req, res, next) => {
  req.log?.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = Number(process.env.PORT || 8000);
app.listen(PORT, ()=> console.log(`Server listening on http://localhost:${PORT}`));
