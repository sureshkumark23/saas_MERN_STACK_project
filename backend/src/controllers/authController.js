const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * SIGNUP CONTROLLER
 */
const signup = async (req, res) => {
  try {
    
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create user (password hashed by middleware)
    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * LOGIN CONTROLLER
 */
const login = async (req, res) => {
  try {
    
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // check user exists
    const user = await User.findOne({ email });
    //console.log("User found in DB:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

   

const isMatch = await bcrypt.compare(password, user.password);


if (!isMatch) {
  return res.status(400).json({ message: "Invalid credentials" });
}


    // ✅ GENERATE JWT HERE
    const token = jwt.sign(
  {
    userId: user._id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);


    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login };
