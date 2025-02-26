const express = require("express");
const app = express();
const port = 5000;
const dbConnection = require("./db/dbconfig.cjs");
const cors = require("cors");

// Import routes
const userRoutes = require("./routes/userRoute.cjs");
const questionRoutes = require("./routes/questionRoute.cjs");
const answerRoutes = require("./routes/answerRoute.cjs");

// Middleware
app.use(express.json());
app.use(cors());

// Route definitions
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);

// Start the server
async function connectToDB() {
  try {
    await dbConnection.execute("SELECT 'test'");
    await app.listen(port);
    console.log(`Server listening on port ${port}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

connectToDB();
