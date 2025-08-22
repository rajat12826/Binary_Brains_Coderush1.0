// controllers/adminController.js
import User from "../modals/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Replace with your secret key
const JWT_SECRET = "your_jwt_secret"; 
const JWT_EXPIRES_IN = "1d"; // token expiry

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await User.findOne({ email, role: "Admin" });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role, email: admin.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        token,
      },
    });

  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
