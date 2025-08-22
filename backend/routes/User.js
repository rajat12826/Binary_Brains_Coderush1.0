
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../modals/User.js";
import { adminLogin } from "../Controllers/user.controller.js";

const router = express.Router();




router.post("/adminlogin", adminLogin);




export default router;