
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../modals/User.js";

const router = express.Router();


router.post("/signup", async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      user_role
      
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
      role: user_role,
      
    });

    await newUser.save();

    res.status(201).json({
      message:
        user_role === "teacher"
          ? "Teacher registered! Waiting for admin approval."
          : "Signup successful!"
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "Invalid email or password" });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    req.session.user = userWithoutPassword;

    res.json({
      message: "Login successful",
      role: user.role,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.json({ message: "Internal server error" });
  }
});


router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.json({ message: "Error logging out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;