// src/index.js
import dotenv from "dotenv";
dotenv.config();

import session from "express-session";
import MongoStore from "connect-mongo";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
// import pino from "pino";
// import pinoHttp from "pino-http";
// import "express-async-errors";

import submissionsRouter from "./routes/submissions.js";
import authorRoutes from "./Controllers/authorRoutes.js";
import User from './routes/User.js';
import { initCloudinary } from "./config/cloudinary.js";
import { Clerk } from "@clerk/backend";

const clerk = new Clerk({
  apiKey: process.env.CLERK_API_KEY,
});


// const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const app = express();
// app.use(pinoHttp({ logger }));

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// -------------------
// MongoDB Connection
// -------------------
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI not set in .env");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// -------------------
// Session Setup
// -------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

// -------------------
// Cloudinary Init
// -------------------
initCloudinary();

// -------------------
// Routes
// -------------------
app.get("/", (_req, res) => res.send("Backend running"));
app.use("/api/submissions", submissionsRouter);
app.use("/api/user", User);
app.use("/api/submissions", authorRoutes);

// -------------------
// Error Handler
// -------------------
app.use((err, req, res, next) => {
  req.log?.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || "Internal Server Error" });
});

// -------------------
// Server Listener
// -------------------
const PORT = Number(process.env.PORT || 8000);
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

