const GroupModel = require("../models/groupModel")
const UserModel = require("../models/userModel") // Ensure this is required if checking user roles
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

    // Create the group
    await GroupModel.createGroup(groupLower)

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
    const user = await UserModel.getUserByUsername(username)
    if (!user) {
      return res.status(404).send("User not found")
    }

    const userGroups = await getUserGroups(username)
    // Add user to each group
    for (const groupName of groups) {
      if (!userGroups.includes(groupName)) {
        await GroupModel.addUserToGroup(username, groupName.value)
      }
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
  console.log(username)
  console.log(groups)
  try {
    // Ensure the user exists
    const user = await UserModel.getUserByUsername(username)
    if (!user) {
      return res.status(404).send("User not found")
    }
    //check users current group
    const userGroups = await getUserGroups(username)
    // remvove user from group
    for (const groupName of groups) {
      console.log(userGroups.includes(groupName))
      if (userGroups.includes(groupName)) {
        await GroupModel.removeUserFromGroup(username, groupName)
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
    const groups = await GroupModel.getAllGroups()
    res.status(200).send(groups)
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
  const { username } = req.query // Extract username from the authenticated user token
  try {
    const groups = await GroupModel.checkUserGroup(username)
    res.send(groups)
  } catch (err) {
    console.error("Error checking user group:", err)
    res.status(500).send("Server error")
  }
}

// Reusable function to check which groups a user belongs to
const getUserGroups = async (username) => {
  try {
    const groups = await GroupModel.checkUserGroup(username)
    return groups
  } catch (err) {
    console.error("Error checking user group:", err)
    throw new Error("Error checking user group")
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
  getUserGroups,
}
