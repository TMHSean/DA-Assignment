const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { generateToken } = require("../utils/auth")
const pool = require("../config/db") // Ensure the path is correct
const db = require("../config/db") // Path to your db configuration

const { checkUserGroups } = require("./groupController")
const { getUserDisabledStatus } = require("./userController")

// Handle user login
const loginUser = async (req, res) => {
  const { username, password } = req.body

  try {
    // Fetch user from the database
    const [users] = await pool.query("SELECT * FROM user WHERE username = ?", [
      username,
    ])
    const user = users[0]

    if (!user) {
      // If no user found, return invalid credentials
      return res.status(401).send("Invalid username or password")
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      // If password does not match, return invalid credentials
      return res.status(401).send("Invalid username or password")
    }

    // Check if the user is disabled
    if (user.disabled === 1) {
      return res.status(403).send("User has been disabled") // Exit after sending the response
    }

    // Generate token and send response
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress
    const browser = req.headers["user-agent"]
    const token = generateToken(user, ip, browser)
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600 * 1000,
    }) // Put secure true if in production
    return res.status(200).send("Login Successful") // Exit after sending the response
  } catch (err) {
    console.error("Error logging in:", err)
    return res.status(500).send("Server error") // Exit after sending the response
  }
}

// Handle user logout (clear token)
const logoutUser = (req, res) => {
  res.clearCookie("jwt")
  res.status(200).send("Logout successful")
}

// Controller function to check user status
const checkUserStatus = async (req, res) => {
  try {
    const user = req.user // User details from the token

    if (!user || !user.username) {
      return res.status(401).send("Unauthorized")
    }

    // check if user is in admin group
    const isAdmin = await checkUserGroups(user.username, "admin")

    // Retrieve the disabled status of the user
    const disabled = await getUserDisabledStatus(user.username)

    res.json({
      username: user.username,
      isAdmin: isAdmin, // Determine admin status
      email: user.email, // Assuming user.email is set from the token or other means
      disabled: disabled,
    })
  } catch (err) {
    console.error("Error checking user status:", err)
    res.status(500).send("Server error")
  }
}

module.exports = {
  loginUser,
  logoutUser,
  checkUserStatus,
}
