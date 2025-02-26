const express = require("express");
const router = express.Router();
const dbConnection = require("../db/dbconfig.cjs");
const authMiddleware = require("../middleware/authMiddleware.js");

// GET route to fetch question by ID
// Fetch answers for a specific question
router.get("/answers/:questionid", async (req, res) => {
  const { questionid } = req.params;

  try {
    const [questionExists] = await dbConnection.query(
      "SELECT * FROM questions WHERE questionid = ?",
      [questionid]
    );

    if (questionExists.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    const [answers] = await dbConnection.query(
      `
      SELECT a.answerid, a.answer, u.username 
      FROM answers a
      JOIN users u ON a.userid = u.userid
      WHERE a.questionid = ?
    `,
      [questionid]
    );

    if (answers.length === 0) {
      return res
        .status(404)
        .json({ message: "No answers found for this question" });
    }

    res.status(200).json(answers);
  } catch (error) {
    console.error("Error fetching answers:", error);
    res.status(500).json({ message: "Failed to fetch answers" });
  }
});

// Apply authMiddleware to protect the endpoint for posting answers
// Post an answer (Requires authentication)
router.post("/answer", authMiddleware, async (req, res) => {
  const { questionid, answer } = req.body;
  const userid = req.user?.userId;

  if (!questionid || !answer) {
    return res
      .status(400)
      .json({ message: "Question ID and answer are required" });
  }

  try {
    const [questionExists] = await dbConnection.query(
      "SELECT * FROM questions WHERE questionid = ?",
      [questionid]
    );

    if (questionExists.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    await dbConnection.query(
      "INSERT INTO answers (questionid, answer, userid) VALUES (?, ?, ?)",
      [questionid, answer, userid]
    );

    res.status(201).json({ message: "Answer posted successfully" });
  } catch (error) {
    console.error("Error posting answer:", error);
    res.status(500).json({ message: "Error posting answer" });
  }
});

module.exports = router;
