const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

// // Login user route
router.post("/login", userController.loginUser)

// Create a new user
router.post("/create", userController.createUser)

// Get all users
router.get("/", userController.getAllUsers)

// Get all active users
router.get("/active", userController.getActiveUsers)

// Get all inactive users
router.get("/inactive", userController.getInactiveUsers)

// Get specific user
router.get("/:username", userController.getUserByUsername)

// Update user details (password and/or email)
router.put("/update/:username", userController.updateUser)

// Set user active or inactive
router.put("/status/:username", userController.setUserStatus)

// Soft delete a user
router.put("/disable/:username", userController.softDeleteUser)

// Hard delete a user (only for testing purposes)
router.delete("/:username", userController.hardDeleteUser)

module.exports = router
