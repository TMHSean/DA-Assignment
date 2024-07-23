const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { generateToken } = require("../utils/auth")
const pool = require("../config/db") // Ensure the path is correct
const userModel = require("../models/userModel")

// Handle user login
const loginUser = async (req, res) => {
  const { username, password } = req.body

  try {
    const [users] = await pool.query("SELECT * FROM user WHERE username = ?", [
      username,
    ])
    const user = users[0]

    if (user && (await bcrypt.compare(password, user.password))) {
      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress
      const browser = req.headers["user-agent"]
      const token = generateToken(user, ip, browser)
      res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3600 * 1000,
      }) // put secure true if in production
      res.status(200).send("Login Successful")
    } else {
      res.status(401).send("Invalid username or password")
    }
  } catch (err) {
    console.error("Error logging in:", err)
    res.status(500).send("Server error")
  }
}

// Handle user logout (clear token)
const logoutUser = (req, res) => {
  res.clearCookie("jwt")
  res.status(200).send("Logout successful")
}

// Additional auth-related methods like registration, password reset, etc.
const registerUser = async (req, res) => {
  // Registration logic
}

// Controller function to check user status
const checkUserStatus = async (req, res) => {
  try {
    const user = req.user // User details from the token
    const dbUser = await UserModel.getUserByUsername(user.username)

    if (dbUser) {
      res.json({
        username: dbUser.username,
        isAdmin: dbUser.username === "admin", // Adjust if you have a specific admin field
      })
    } else {
      res.status(404).send("User not found")
    }
  } catch (err) {
    console.error("Error checking user status:", err)
    res.status(500).send("Server error")
  }
}

module.exports = {
  loginUser,
  logoutUser,
  registerUser,
  checkUserStatus,
}
