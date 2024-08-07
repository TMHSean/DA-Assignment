const express = require("express")
const authMgmt = require("../controllers/authMgmt")
const {
  authenticateToken,
  authenticateAdmin,
  authorizeGroup,
} = require("../middleware/authMiddleware")

const router = express.Router()

// Route for user login
router.post("/login", authMgmt.loginUser)

// Route for user logout, requires authentication
router.post("/logout", authenticateToken, authMgmt.logoutUser)

// Route to check user status, requires authentication
router.get("/check", authenticateToken, authMgmt.checkUserStatus)

// Route to check user status, requires authentication
router.get("/checkusergroup", authenticateToken, authMgmt.checkUserGroup)

module.exports = router
