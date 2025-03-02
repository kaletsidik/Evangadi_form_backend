const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Import user controller
const {
  register,
  login,
  checkUser,
} = require("../controller/userController.cjs");
// Register route
router.post("/register", register);

//  login user

router.post("/login", login);

// check user
router.get("/check", authMiddleware, checkUser);

module.exports = router;
