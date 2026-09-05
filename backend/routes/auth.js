const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // 1. Check यह लाइन ऊपर है या नहीं
const db = require("../db");

const router = express.Router();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Register route (जैसा है वैसा ही रहने दें)
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = typeof name === "string" ? name.trim() : "";
    email = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required."
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      userId: result.insertId
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered."
      });
    }

    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during registration."
    });
  }
});

// Login route (यह हिस्सा check करें)
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const [users] = await db.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      await bcrypt.hash(password, 12);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 2. Token generation
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "ai_notes_fallback_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );


    console.log(">>> Generated Token:", token); // <-- यह लाइन जोड़ें
    // 3. Send response WITH token
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token, // <-- यह key होनी चाहिए
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login."
    });
  }
});


const verifyToken = require("../middleware/authMiddleware");

// Protected Route: sirf valid token ke sath access hoga
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile."
    });
  }
});

module.exports = router;