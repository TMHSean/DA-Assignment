const db = require("../config/db") // Path to your db configuration

// Create a new group
const createGroup = async (groupName, username = null) => {
  let query = "INSERT INTO usergroup (group_name"
  const values = [groupName]
  if (username) {
    query += ", username) VALUES (?, ?)"
    values.push(username)
  } else {
    query += ") VALUES (?)"
  }

  await db.query(query, values)
}

// Add a user to a group
const addUserToGroup = async (username, groupName) => {
  const query = "INSERT INTO usergroup (username, group_name) VALUES (?, ?)"
  await db.query(query, [username, groupName])
}

// Remove a user from a group
const removeUserFromGroup = async (username, groupName) => {
  const query = "DELETE FROM usergroup WHERE username = ? AND group_name = ?"
  await db.query(query, [username, groupName])
}

// Get all groups
const getAllGroups = async () => {
  const [results] = await db.query("SELECT DISTINCT group_name FROM usergroup")
  return results
}

// Get all records from usergroup table
const getAllRecords = async () => {
  const [results] = await db.query("SELECT * FROM usergroup")
  return results
}

// Get users in a specific group
const getUsersInGroup = async (groupName) => {
  const [results] = await db.query(
    "SELECT username FROM usergroup WHERE group_name = ?",
    [groupName]
  )
  return results.map((row) => row.username)
}

// Check which group a user belongs to
const checkUserGroup = async (username) => {
  const [results] = await db.query(
    "SELECT group_name FROM usergroup WHERE username = ?",
    [username]
  )
  return results.map((row) => row.group_name)
}

module.exports = {
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
  getAllGroups,
  getAllRecords,
  getUsersInGroup,
  checkUserGroup,
}
