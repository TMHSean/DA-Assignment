const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware")

// Create a new user (if needed for admin purposes)
router.post(
  "/create",
  authenticateToken,
  authorizeAdmin,
  userController.createUser
)

// Get all users
router.get("/", authenticateToken, userController.getAllUsers)

// Other user routes with authentication
router.get("/active", authenticateToken, userController.getActiveUsers)
router.get("/inactive", authenticateToken, userController.getInactiveUsers)
router.get("/:username", authenticateToken, userController.getUserByUsername)
router.put(
  "/update/:username",
  authenticateToken,
  authorizeAdmin,
  userController.updateUser
)
router.put(
  "/status/:username",
  authenticateToken,
  authorizeAdmin,
  userController.setUserStatus
)
router.put(
  "/disable/:username",
  authenticateToken,
  authorizeAdmin,
  userController.softDeleteUser
)
router.delete(
  "/:username",
  authenticateToken,
  authorizeAdmin,
  userController.hardDeleteUser
)

module.exports = router
