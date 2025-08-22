// src/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

/**
 * Call initCloudinary() at app startup to set credentials (optional).
 * The cloudinary object is exported so other modules can use cloudinary.uploader.upload(...)
 */
export function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLDN_NAME,
    api_key: process.env.CLDN_API_KEY,
    api_secret: process.env.CLDN_API_SECRET,
    secure: true
  });
}

/**
 * Export the cloudinary object itself for upload usage.
 */
export default cloudinary;