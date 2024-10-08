const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ username, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("profile", token, {
      httpOnly: true, // Prevent JavaScript access to the cookie (optional for security)
      secure: true, // Only send cookie over HTTPS
      sameSite: "None", // Required for cross-site cookie usage in modern browsers
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration: 1 day
    });
    // res.cookie("user", username, {
    //   httpOnly: true, // Prevent JavaScript access to the cookie (optional for security)
    //   secure: true, // Only send cookie over HTTPS
    //   sameSite: "None", // Required for cross-site cookie usage in modern browsers
    //   maxAge: 24 * 60 * 60 * 1000, // Cookie expiration: 1 day
    // });
    res.status(201).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("profile", token, {
      secure: true, // Only send cookie over HTTPS
      sameSite: "None", // Required for cross-site cookie usage in modern browsers
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration: 1 day
    });
    // res.cookie("user", username, {
    //   secure: true, // Only send cookie over HTTPS
    //   sameSite: "None", // Required for cross-site cookie usage in modern browsers
    //   maxAge: 24 * 60 * 60 * 1000, // Cookie expiration: 1 day
    // });
    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
