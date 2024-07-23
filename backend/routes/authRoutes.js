const express = require("express")
const {
  loginUser,
  logoutUser,
  registerUser,
  checkUserStatus,
} = require("../controllers/authController")
const {
  authenticateToken,
  authenticateAdmin,
} = require("../middleware/authMiddleware")

const router = express.Router()

// // Route for user registration, accessible only by admin
// router.post("/register", authenticateToken, authenticateAdmin, registerUser)

// Route for user login
router.post("/login", loginUser)

// // Route for user logout, requires authentication
// router.post("/logout", authenticateToken, logoutUser)

// // Route to check user status, requires authentication
// router.get("/check", authenticateToken, checkUserStatus)

module.exports = router
