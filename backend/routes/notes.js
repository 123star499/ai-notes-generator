const express = require("express");
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");
const { generateNotesFromAI } = require("../services/aiService");

const router = express.Router();

// 1. Generate Notes via AI and Save (Protected)
router.post("/generate", verifyToken, async (req, res) => {
  try {
    const { topic, format } = req.body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: "Topic is required to generate notes."
      });
    }

    // Generate content using Gemini service
    const aiGeneratedContent = await generateNotesFromAI(topic.trim(), format);

    // Auto-save directly into MySQL database for logged-in user
    const [result] = await db.query(
      "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
      [req.user.id, topic.trim(), aiGeneratedContent]
    );

    return res.status(201).json({
      success: true,
      message: "AI notes generated and saved successfully.",
      note: {
        id: result.insertId,
        title: topic.trim(),
        content: aiGeneratedContent
      }
    });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate notes using AI."
    });
  }
});

// 2. Create a Manual Note (Protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required."
      });
    }

    const [result] = await db.query(
      "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
      [req.user.id, title.trim(), content.trim()]
    );

    return res.status(201).json({
      success: true,
      message: "Note created successfully.",
      noteId: result.insertId
    });
  } catch (error) {
    console.error("Create Note Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create note."
    });
  }
});

// 3. Get All Notes of Logged-in User (Protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const [notes] = await db.query(
      "SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    console.error("Fetch Notes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes."
    });
  }
});

// 4. Delete a Note (Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const noteId = req.params.id;

    const [result] = await db.query(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [noteId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Note not found or unauthorized to delete."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully."
    });
  } catch (error) {
    console.error("Delete Note Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete note."
    });
  }
});

module.exports = router;