const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const db = require("./db");
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");

const app = express();

// Render रिवर्स प्रॉक्सी के पीछे चलता है, इसलिए रेट लिमिटर के लिए इसे इनेबल करना ज़रूरी है
app.set("trust proxy", 1);

// 1. Security Headers
app.use(helmet());

// 2. CORS Policy (Local + Production Vercel App)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ai-notes-generator-seven.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // मोबाइल ऐप्स, पोस्टमैन या बिना ऑरिजिन वाली रिक्वेस्ट्स को अनुमति दें
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight (OPTIONS) रिक्वेस्ट्स को सही से हैंडल करने के लिए
app.options("*", cors());

// 3. Body Parser with payload size restriction
app.use(express.json({ limit: "10kb" }));

// 4. Rate Limiter for Gemini AI Generation (Prevents API quota abuse)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20, // Limit each IP to 20 AI generations per window
  message: {
    success: false,
    message: "Too many AI generation requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter specifically to the AI route
app.use("/api/notes/generate", aiLimiter);

// 5. Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "Healthy",
    message: "AI Notes Generator Backend is Live and Secure!",
  });
});

// Test Users Endpoint
app.get("/api/test-users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email FROM users");
    res.json({
      success: true,
      users: rows,
    });
  } catch (error) {
    console.error("Test Users Query Failed:", error);
    res.status(500).json({
      success: false,
      message: "Database query failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

db.getConnection()
  .then((connection) => {
    console.log("MySQL Database Connected Successfully!");
    connection.release();
  })
  .catch((error) => {
    console.error("MySQL Connection Failed:", error.message);
  });