// createAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../modals/User.js"; // Adjust path if needed

// MongoDB connection URI
const MONGO_URI = "mongodb+srv://harshalmakode26:hqC6rE1DgIGotQu6@cluster0.hmdsu0x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your DB URI

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin12@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin@123", 10);

    // Create admin user
    const adminUser = new User({
      name: "admin",
      email: "admin12@gmail.com",
      password: hashedPassword,
      role: "Admin"
    });

    await adminUser.save();
    console.log("Admin user created successfully");

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin user:", err);
    process.exit(1);
  }
}

// Run the function
createAdmin();
