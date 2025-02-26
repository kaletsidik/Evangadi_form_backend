const dbConnection = require("../db/dbconfig.cjs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  const { username, firstname, lastname, email, password } = req.body;

  if (!username || !firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: "All input is required" });
  }

  try {
    const [user] = await dbConnection.query(
      "SELECT username, userid FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (user.length > 0) {
      return res.status(400).json({ message: "User  already exists" });
    }
    if (password.length <= 6) {
      return res.status(400).json({
        message: "Password should be at least 6 characters long",
      });
    }
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbConnection.query(
      "INSERT INTO users (username, firstname, lastname, email, password) VALUES (?,?,?,?,?)",
      [username, firstname, lastname, email, hashedPassword]
    );
    res.status(201).json({ message: "User  created successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please enter all required fields" });
  }

  try {
    // Check if user exists
    const [users] = await dbConnection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "User  not found" });
    }

    const user = users[0]; // Get the first user

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const username = user.username; // Access username directly
    const userId = user.userid; // Access userId directly
    // const token = jwt.sign({ username, userId }, process.env.JWT_SECRET, {
    //   expiresIn: "1d", // Token expiration time
    // });
    const token = jwt.sign(
      { username, userId: user.userid },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d", // Token expiration time
      }
    );

    // Successful login
    return res
      .status(200)
      .json({ message: " User Login successful", token, username });
  } catch (error) {
    console.error("Error during login:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong, try again later" });
  }
}

function checkUser(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  return res.status(200).json({
    message: "User is authenticated",
    username: req.user.username,
    userid: req.user.userId, // Make sure this matches the key in your JWT payload
  });
}

module.exports = { register, login, checkUser };
