const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

// Create a new user
router.post("/create", userController.createUser)

// Get all users
router.get("/", userController.getAllUsers)

// Get all active users
router.get("/active", userController.getActiveUsers)

// Get all inactive users
router.get("/inactive", userController.getInactiveUsers)

// Get specific user
router.get("/:id", userController.getUserById)

// Update user details (password and/or email)
router.put("/update/:id", userController.updateUser)

// Set user active or inactive
router.put("/status/:id", userController.setUserStatus)

// Soft delete a user
router.put("/disable/:id", userController.softDeleteUser)

// Hard delete a user (only for testing purposes)
router.delete("/:id", userController.hardDeleteUser)

module.exports = router
