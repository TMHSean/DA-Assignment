const pool = require("../config/db") // Path to your db configuration
const bcrypt = require("bcryptjs")
const {
  validateCreateUser,
  validateUpdateUserProfile,
  validateCreateGroup
} = require("../utils/validation")

//**** UTILS  ******/

// Function to hash the password
const hashPassword = async (password) => {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

// Function to compare passwords
const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword)
}

//**** USER  ******/

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
    await pool.query(query, [username, hashedPassword, email, disabled])
    res.status(201).json({ message: "User created successfully" })
  } catch (err) {
    console.error("Error creating user:", err)
    res.status(500).json({ errors: ["Server error"] })
  }
}

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM user")
    res.json(results)
  } catch (err) {
    console.error("Error fetching users:", err)
    res.status(500).send("Server error")
  }
}

// Get all active users
const getActiveUsers = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM user WHERE disabled = 0")
    res.json(results)
  } catch (err) {
    console.error("Error fetching active users:", err)
    res.status(500).send("Server error")
  }
}

// Get all inactive users
const getInactiveUsers = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM user WHERE disabled = 1")
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
    const [results] = await pool.query("SELECT * FROM user WHERE username = ?", [
      username,
    ])
    const user = results[0]
    if (!user) {
      return res.status(404).send("User not found 2")
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

    await pool.query(query, params)
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
    await pool.query("UPDATE user SET disabled = ? WHERE username = ?", [
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
    await pool.query("UPDATE user SET disabled = 1 WHERE username = ?", [
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
    await pool.query("DELETE FROM user WHERE username = ?", [username])
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
    const [rows] = await pool.query("SELECT * FROM user WHERE username = ?", [
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

//**** GROUPS  ******/


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

    await pool.query(query, values)

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
    const [userResults] = await pool.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    )
    if (userResults.length === 0) {
      return res.status(404).send("User not found 3")
    }

    // Add user to each group
    for (const groupName of groups) {
      const groupLower = groupName.value.toLowerCase()
      await pool.query(
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
    const [userResults] = await pool.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    )
    if (userResults.length === 0) {
      return res.status(404).send("User not found 1")
    }

    // Check user's current groups
    const [userGroupsResults] = await pool.query(
      "SELECT group_name FROM usergroup WHERE username = ?",
      [username]
    )
    const userGroups = userGroupsResults.map((row) => row.group_name)

    // Remove user from specified groups
    for (const groupName of groups) {
      if (userGroups.includes(groupName)) {
        await pool.query(
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
  console.log("TESTTESTTEST")
  try {
    const [results] = await pool.query(
      "SELECT DISTINCT group_name FROM usergroup"
    )
    console.log("TRY")
    res.status(200).send(results)
  } catch (err) {
    console.error("Error fetching groups:", err)
    res.status(500).send("Server error")
  }
}

// Get all records from usergroup table
const getAllRecords = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM usergroup")
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
    const [results] = await pool.query(
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

const groupExists = async (groupName) => {
  try {
    const [results] = await pool.query(
      "SELECT COUNT(*) AS count FROM usergroup WHERE LOWER(group_name) = LOWER(?)",
      [groupName]
    )
    if (results.length > 0) {
      return results[0].count > 0
    } else {
      return false
    }
  } catch (err) {
    console.error("Error checking group existence:", err)
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
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
  getAllGroups,
  getAllRecords,
  getUsersInGroup,
  groupExists
}
