const express = require("express");
const router = express.Router();
const dbConnection = require("../db/dbconfig.cjs"); // Correct import
const authMiddleware = require("../middleware/authMiddleware.js"); // Correct import

// Post a question
router.post("/all-questions", authMiddleware, async (req, res) => {
  const { title, description, tag } = req.body;
  const { userId: userid } = req.user;

  if (!userid) {
    return res.status(400).json({ message: "User is not authenticated" });
  }

  try {
    const [result] = await dbConnection.query(
      "INSERT INTO questions (title, tag, description, userid, questionid) VALUES (?, ?, ?, ?, UUID())",
      [title, tag, description, userid]
    );

    const [newQuestion] = await dbConnection.query(
      "SELECT questionid FROM questions WHERE userid = ? ORDER BY questionid DESC LIMIT 1",
      [userid]
    );

    if (newQuestion.length > 0) {
      res.status(201).json({
        message: "Question posted successfully",
        id: newQuestion[0].questionid,
      });
    } else {
      res.status(500).json({ message: "Error retrieving question ID" });
    }
  } catch (error) {
    console.error("Error posting question:", error.message);
    res
      .status(500)
      .json({ message: "Error posting question", error: error.message });
  }
});

// Route to fetch all questions with the associated username (Requires Authentication)
// Fetch all questions
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    const [questions] = await dbConnection.query(`
      SELECT q.id, q.title, q.questionid, q.tag, q.description, u.username 
      FROM questions q
      JOIN users u ON q.userid = u.userid
    `);

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found" });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

module.exports = router;
