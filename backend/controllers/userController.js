const db = require("../config/db") // Path to your db configuration
const bcrypt = require("bcryptjs")
const {
  validateCreateUser,
  validateUpdateUserProfile,
} = require("../utils/validation")

// Function to hash the password
const hashPassword = async (password) => {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

// Function to compare passwords
const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword)
}

// Create a new user
const createUser = async (req, res) => {
  const { username, password, email, disabled = 0 } = req.body

  // Validate inputs
  const errors = await validateCreateUser(username, password, email)
  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }

  try {
    const hashedPassword = await hashPassword(password)
    const query =
      "INSERT INTO user (username, password, email, disabled) VALUES (?, ?, ?, ?)"
    await db.query(query, [username, hashedPassword, email, disabled])
    res.status(201).json({ message: "User created successfully" })
  } catch (err) {
    console.error("Error creating user:", err)
    res.status(500).json({ errors: ["Server error"] })
  }
}

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM user")
    res.json(results)
  } catch (err) {
    console.error("Error fetching users:", err)
    res.status(500).send("Server error")
  }
}

// Get all active users
const getActiveUsers = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM user WHERE disabled = 0")
    res.json(results)
  } catch (err) {
    console.error("Error fetching active users:", err)
    res.status(500).send("Server error")
  }
}

// Get all inactive users
const getInactiveUsers = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM user WHERE disabled = 1")
    res.json(results)
  } catch (err) {
    console.error("Error fetching inactive users:", err)
    res.status(500).send("Server error")
  }
}

// Get specific user
const getUserByUsername = async (req, res) => {
  const { username } = req.params

  try {
    const [results] = await db.query("SELECT * FROM user WHERE username = ?", [
      username,
    ])
    const user = results[0]
    if (!user) {
      return res.status(404).send("User not found")
    }
    res.json(user)
  } catch (err) {
    console.error("Error fetching user:", err)
    res.status(500).send("Server error")
  }
}

// Update user details (password and/or email)
const updateUser = async (req, res) => {
  const { username } = req.params
  const { password, email } = req.body

  if (!password && !email) {
    return res
      .status(400)
      .send("At least one field (password or email) is required to update.")
  }

  // Validate inputs
  const errors = await validateUpdateUserProfile(password, email)
  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }

  try {
    let query = "UPDATE user SET"
    const params = []

    if (password) {
      const hashedPassword = await hashPassword(password)
      query += " password = ?,"
      params.push(hashedPassword)
    }
    if (email) {
      query += " email = ?,"
      params.push(email)
    }
    query = query.slice(0, -1) + " WHERE username = ?"
    params.push(username)

    await db.query(query, params)
    res.status(201).json({ message: "User updated successfully" })
  } catch (err) {
    console.error("Error updating user:", err)
    res.status(500).send("Server error")
  }
}

// Set user active or inactive
const setUserStatus = async (req, res) => {
  const { username } = req.params
  const { disabled } = req.body

  if (typeof disabled !== "number" || (disabled !== 0 && disabled !== 1)) {
    return res
      .status(400)
      .send("Disabled status must be 0 (active) or 1 (inactive).")
  }

  try {
    await db.query("UPDATE user SET disabled = ? WHERE username = ?", [
      disabled,
      username,
    ])
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
  const { username } = req.params

  try {
    await db.query("UPDATE user SET disabled = 1 WHERE username = ?", [
      username,
    ])
    res.send("User disabled successfully")
  } catch (err) {
    console.error("Error disabling user:", err)
    res.status(500).send("Server error")
  }
}

// Hard delete a user
const hardDeleteUser = async (req, res) => {
  const { username } = req.params

  try {
    await db.query("DELETE FROM user WHERE username = ?", [username])
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
    const [rows] = await db.query("SELECT * FROM user WHERE username = ?", [
      username,
    ])
    if (!rows.length) {
      return res.status(401).send("Invalid username or password")
    }

    const user = rows[0]
    const isMatch = await comparePasswords(password, user.password)

    if (isMatch) {
      res.status(200).send("Login successful")
    } else {
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
  getUserByUsername,
  updateUser,
  setUserStatus,
  softDeleteUser,
  hardDeleteUser,
  loginUser,
}
