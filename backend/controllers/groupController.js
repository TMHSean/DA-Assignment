const GroupModel = require("../models/groupModel")
const UserModel = require("../models/userModel") // Ensure this is required if checking user roles
const db = require("../config/db") // Path to your db configuration
const { validateCreateGroup } = require("../utils/validation")

// Create a new group
const createGroup = async (req, res) => {
  const { groupName } = req.body

  // Validate inputs
  const errors = await validateCreateGroup(groupName)
  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }

  try {
    // Convert groupName to lowercase for consistency
    const groupLower = groupName.toLowerCase()

    const query = "INSERT INTO usergroup (group_name) VALUES (?)"
    const values = [groupLower]

    await db.query(query, values)

    res.status(201).json({ message: "Group created successfully" })
  } catch (err) {
    console.error("Error creating group:", err)
    res.status(500).json({ errors: ["Server error"] })
  }
}

// Add a user to a group
const addUserToGroup = async (req, res) => {
  const { username, groups } = req.body

  try {
    // Ensure the user exists
    const [userResults] = await db.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    )
    if (userResults.length === 0) {
      return res.status(404).send("User not found")
    }

    // Add user to each group
    for (const groupName of groups) {
      console.log(groups)
      console.log(groupName.value)
      const groupLower = groupName.value.toLowerCase()
      await db.query(
        "INSERT INTO usergroup (username, group_name) VALUES (?, ?)",
        [username, groupLower]
      )
    }

    res.status(200).send("User added to group successfully")
  } catch (err) {
    console.error("Error adding user to group:", err)
    res.status(500).send("Server error")
  }
}

// Remove a user from a group
const removeUserFromGroup = async (req, res) => {
  const { username, groups } = req.query

  try {
    // Ensure the user exists
    const [userResults] = await db.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    )
    if (userResults.length === 0) {
      return res.status(404).send("User not found")
    }

    // Check user's current groups
    const [userGroupsResults] = await db.query(
      "SELECT group_name FROM usergroup WHERE username = ?",
      [username]
    )
    const userGroups = userGroupsResults.map((row) => row.group_name)

    // Remove user from specified groups
    for (const groupName of groups) {
      if (userGroups.includes(groupName)) {
        await db.query(
          "DELETE FROM usergroup WHERE username = ? AND group_name = ?",
          [username, groupName]
        )
      }
    }

    res.status(200).send("User removed from group successfully")
  } catch (err) {
    console.error("Error removing user from group:", err)
    res.status(500).send("Server error")
  }
}

// Get all groups
const getAllGroups = async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT DISTINCT group_name FROM usergroup"
    )
    res.status(200).send(results)
  } catch (err) {
    console.error("Error fetching groups:", err)
    res.status(500).send("Server error")
  }
}

// Get all records from usergroup table
const getAllRecords = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM usergroup")
    res.send(results)
  } catch (err) {
    console.error("Error fetching records:", err)
    res.status(500).send("Server error")
  }
}

// Get users in a specific group
const getUsersInGroup = async (req, res) => {
  const { groupName } = req.body
  try {
    const [results] = await db.query(
      "SELECT username FROM usergroup WHERE group_name = ?",
      [groupName]
    )
    const users = results.map((row) => row.username)
    res.send(users)
  } catch (err) {
    console.error("Error fetching users in group:", err)
    res.status(500).send("Server error")
  }
}

// Check which groups a user belongs to
const checkUserGroup = async (req, res) => {
  const { username } = req.query // Extract username from the query params
  try {
    const [results] = await db.query(
      "SELECT group_name FROM usergroup WHERE username = ?",
      [username]
    )
    const groups = results.map((row) => row.group_name)
    res.send(groups)
  } catch (err) {
    console.error("Error checking user group:", err)
    res.status(500).send("Server error")
  }
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
