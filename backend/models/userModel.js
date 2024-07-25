const db = require("../config/db") // Path to your db configuration
const bcrypt = require("bcryptjs")

// Function to hash the password
const hashPassword = async (password) => {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

// Function to compare passwords
const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword)
}

// Get all users
const getAllUsers = async () => {
  const [results] = await db.query("SELECT * FROM user")
  return results
}

// Get active users
const getActiveUsers = async () => {
  const [results] = await db.query("SELECT * FROM user WHERE disabled = 0")
  return results
}

// Get inactive users
const getInactiveUsers = async () => {
  const [results] = await db.query("SELECT * FROM user WHERE disabled = 1")
  return results
}

// Get specific user by username
const getUserByUsername = async (username) => {
  const [results] = await db.query("SELECT * FROM user WHERE username = ?", [
    username,
  ])
  return results[0]
}

// Create a new user
const createUser = async (username, password, email, disabled = 0) => {
  const hashedPassword = await hashPassword(password)
  const query =
    "INSERT INTO user (username, password, email, disabled) VALUES (?, ?, ?, ?)"
  await db.query(query, [username, hashedPassword, email, disabled])
  return { username, email, disabled } // Return the created user details
}

// Update user details (password and/or email)
const updateUser = async (username, password, email) => {
  console.log(username)
  console.log("Aboce")
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
}

// Set user active or inactive
const setUserStatus = async (username, disabled) => {
  await db.query("UPDATE user SET disabled = ? WHERE username = ?", [
    disabled,
    username,
  ])
}

// Soft delete a user
const softDeleteUser = async (username) => {
  await db.query("UPDATE user SET disabled = 1 WHERE username = ?", [username])
}

// Hard delete a user
const hardDeleteUser = async (username) => {
  await db.query("DELETE FROM user WHERE username = ?", [username])
}

// Find user by credentials
const findUserByCredentials = async (username, password) => {
  const [rows] = await db.query("SELECT * FROM user WHERE username = ?", [
    username,
  ])

  if (!rows.length) {
    return null // No user found
  }

  const user = rows[0]
  const isMatch = await comparePasswords(password, user.password)
  return isMatch ? user : null
}

module.exports = {
  getAllUsers,
  getActiveUsers,
  getInactiveUsers,
  getUserByUsername,
  createUser,
  updateUser,
  setUserStatus,
  softDeleteUser,
  hardDeleteUser,
  findUserByCredentials,
}
