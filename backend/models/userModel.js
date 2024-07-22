const db = require("../config/db") // Path to your db configuration

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

// Get specific user
const getUserById = async (id) => {
  const [results] = await db.query("SELECT * FROM user WHERE id = ?", [id])
  return results[0]
}

// Create a new user
const createUser = async (username, password, email, disabled = 0) => {
  const [result] = await db.query(
    "INSERT INTO user (username, password, email, disabled) VALUES (?, ?, ?, ?)",
    [username, password, email, disabled]
  )
  return result.insertId
}

// Update user details (password and/or email)
const updateUser = async (id, password, email) => {
  let query = "UPDATE user SET"
  const params = []

  if (password) {
    query += " password = ?,"
    params.push(password)
  }
  if (email) {
    query += " email = ?,"
    params.push(email)
  }
  query = query.slice(0, -1) + " WHERE id = ?"
  params.push(id)

  await db.query(query, params)
}

// Set user active or inactive
const setUserStatus = async (id, disabled) => {
  await db.query("UPDATE user SET disabled = ? WHERE id = ?", [disabled, id])
}

// Soft delete a user
const softDeleteUser = async (id) => {
  await db.query("UPDATE user SET disabled = 1 WHERE id = ?", [id])
}

// Hard delete a user
const hardDeleteUser = async (id) => {
  await db.query("DELETE FROM user WHERE id = ?", [id])
}

module.exports = {
  getAllUsers,
  getActiveUsers,
  getInactiveUsers,
  getUserById,
  createUser,
  updateUser,
  setUserStatus,
  softDeleteUser,
  hardDeleteUser,
}
