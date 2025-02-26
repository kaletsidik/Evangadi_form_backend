const mysql2 = require("mysql2");
require("dotenv").config();
// Create a connection pool with promises
const dbConnection = mysql2
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 10,
  })
  .promise(); // Use the promise-based pool

async function createUsersTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      userid INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(30) NOT NULL UNIQUE,
      firstname VARCHAR(50) NOT NULL,
      lastname VARCHAR(50) NOT NULL,
      email VARCHAR(200) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );
  `;
  await dbConnection.query(query);
}

async function createQuestionTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS questions (
      id INT(20) NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      questionid VARCHAR(100) NOT NULL UNIQUE,
      tag VARCHAR(20),
      description VARCHAR(200) NOT NULL,
      userid INT(20) NOT NULL,
      PRIMARY KEY (id, questionid),
      FOREIGN KEY (userid) REFERENCES users(userid)
    );
  `;
  await dbConnection.query(query);
}

async function createAnswerTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS answers (
      answerid INT(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userid INT(30) NOT NULL,
      questionid VARCHAR(100) NOT NULL,
      answer VARCHAR(200) NOT NULL,
      FOREIGN KEY (questionid) REFERENCES questions(questionid),
      FOREIGN KEY (userid) REFERENCES users(userid)
    );
  `;
  await dbConnection.query(query);
}

async function initializeDatabase() {
  try {
    await createUsersTable();
    await createQuestionTable();
    await createAnswerTable();
    // console.log("All tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

// Initialize the database
initializeDatabase();

// Export the dbConnection for use in other parts of the application
module.exports = dbConnection;

// Gracefully close the pool when the application is shutting down
process.on("SIGINT", async () => {
  console.log("Closing database connection pool...");
  await dbConnection.end();
  console.log("Connection pool closed.");
  process.exit(0);
});
