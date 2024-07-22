const UserModel = require("../models/userModel")

// Create a new user
const createUser = async (req, res) => {
  const { username, password, email, disabled = 0 } = req.body

  try {
    // Check if the username already exists
    const existingUser = await UserModel.getUserById(username)
    if (existingUser) {
      return res.status(400).send("Username already exists")
    }

    const id = await UserModel.createUser(username, password, email, disabled)
    res.status(201).send({ id })
  } catch (err) {
    console.error("Error creating user:", err)
    res.status(500).send("Server error")
  }
}

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers()
    res.send(users)
  } catch (err) {
    console.error("Error fetching users:", err)
    res.status(500).send("Server error")
  }
}

// Get all active users
const getActiveUsers = async (req, res) => {
  try {
    const users = await UserModel.getActiveUsers()
    res.send(users)
  } catch (err) {
    console.error("Error fetching active users:", err)
    res.status(500).send("Server error")
  }
}

// Get all inactive users
const getInactiveUsers = async (req, res) => {
  try {
    const users = await UserModel.getInactiveUsers()
    res.send(users)
  } catch (err) {
    console.error("Error fetching inactive users:", err)
    res.status(500).send("Server error")
  }
}

// Get specific user
const getUserById = async (req, res) => {
  const { id } = req.params

  try {
    const user = await UserModel.getUserById(id)
    if (!user) {
      return res.status(404).send("User not found")
    }
    res.send(user)
  } catch (err) {
    console.error("Error fetching user:", err)
    res.status(500).send("Server error")
  }
}

// Update user details (password and/or email)
const updateUser = async (req, res) => {
  const { id } = req.params
  const { password, email } = req.body

  if (!password && !email) {
    return res
      .status(400)
      .send("At least one field (password or email) is required to update.")
  }

  try {
    await UserModel.updateUser(id, password, email)
    res.send("User updated successfully")
  } catch (err) {
    console.error("Error updating user:", err)
    res.status(500).send("Server error")
  }
}

// Set user active or inactive
const setUserStatus = async (req, res) => {
  const { id } = req.params
  const { disabled } = req.body

  if (typeof disabled !== "number" || (disabled !== 0 && disabled !== 1)) {
    return res
      .status(400)
      .send("Disabled status must be 0 (active) or 1 (inactive).")
  }

  try {
    await UserModel.setUserStatus(id, disabled)
    res.send(
      `User ${disabled === 1 ? "deactivated" : "activated"} successfully`
    )
  } catch (err) {
    console.error("Error updating user status:", err)
    res.status(500).send("Server error")
  }
}

// Soft delete a user
const softDeleteUser = async (req, res) => {
  const { id } = req.params

  try {
    await UserModel.softDeleteUser(id)
    res.send("User disabled successfully")
  } catch (err) {
    console.error("Error disabling user:", err)
    res.status(500).send("Server error")
  }
}

// Hard delete a user
const hardDeleteUser = async (req, res) => {
  const { id } = req.params

  try {
    await UserModel.hardDeleteUser(id)
    res.send("User deleted successfully")
  } catch (err) {
    console.error("Error deleting user:", err)
    res.status(500).send("Server error")
  }
}

// Controller function to handle user login
const loginUser = async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserModel.findUserByCredentials(username, password)

    if (user) {
      // User found and password matches
      res.status(200).send("Login successful")
    } else {
      // User not found or password incorrect
      res.status(401).send("Invalid username or password")
    }
  } catch (err) {
    console.error("Error logging in:", err)
    res.status(500).send("Server error")
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getActiveUsers,
  getInactiveUsers,
  getUserById,
  updateUser,
  setUserStatus,
  softDeleteUser,
  hardDeleteUser,
  loginUser,
}
