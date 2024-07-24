const GroupModel = require("../models/groupModel")
const UserModel = require("../models/userModel") // Ensure this is required if checking user roles

// Create a new group
const createGroup = async (req, res) => {
  const { groupName, username } = req.body

  try {
    // Check if the group already exists
    const existingGroups = await GroupModel.getAllGroups()
    if (existingGroups.some((group) => group.group_name === groupName)) {
      return res.status(400).send("Group already exists")
    }

    await GroupModel.createGroup(groupName, username)
    res.status(201).send("Group created successfully")
  } catch (err) {
    console.error("Error creating group:", err)
    res.status(500).send("Server error")
  }
}

// Add a user to a group
const addUserToGroup = async (req, res) => {
  const { username, groupName } = req.body

  try {
    // Ensure the user exists
    const user = await UserModel.getUserByUsername(username)
    if (!user) {
      return res.status(404).send("User not found")
    }

    await GroupModel.addUserToGroup(username, groupName)
    res.status(200).send("User added to group successfully")
  } catch (err) {
    console.error("Error adding user to group:", err)
    res.status(500).send("Server error")
  }
}

// Remove a user from a group
const removeUserFromGroup = async (req, res) => {
  const { username, groupName } = req.body

  try {
    // Ensure the user exists
    const user = await UserModel.getUserByUsername(username)
    if (!user) {
      return res.status(404).send("User not found")
    }

    await GroupModel.removeUserFromGroup(username, groupName)
    res.status(200).send("User removed from group successfully")
  } catch (err) {
    console.error("Error removing user from group:", err)
    res.status(500).send("Server error")
  }
}

// Get all groups
const getAllGroups = async (req, res) => {
  try {
    const groups = await GroupModel.getAllGroups()
    res.send(groups)
  } catch (err) {
    console.error("Error fetching groups:", err)
    res.status(500).send("Server error")
  }
}

// Get all records from usergroup table
const getAllRecords = async (req, res) => {
  try {
    const records = await GroupModel.getAllRecords()
    res.send(records)
  } catch (err) {
    console.error("Error fetching records:", err)
    res.status(500).send("Server error")
  }
}

// Get users in a specific group
const getUsersInGroup = async (req, res) => {
  const { groupName } = req.body
  try {
    const users = await GroupModel.getUsersInGroup(groupName)
    res.send(users)
  } catch (err) {
    console.error("Error fetching users in group:", err)
    res.status(500).send("Server error")
  }
}

// Check which groups a user belongs to
const checkUserGroup = async (req, res) => {
  const { username } = req.body

  try {
    const groups = await GroupModel.checkUserGroup(username)
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
