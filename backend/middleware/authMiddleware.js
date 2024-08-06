// Page for authenticating JWT Tokens
const { verifyToken } = require("../utils/auth")
const db = require("../config/db") // Path to your db configuration

function authenticateToken(req, res, next) {
  const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const user = verifyToken(token)
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  req.user = user
  next()
}

// Check if a user belongs to a specific group
const checkGroup = async (username, groupName) => {
  try {
    // Query to get all group names for the user
    const [results] = await db.query(
      "SELECT group_name FROM usergroup WHERE username = ?",
      [username]
    )

    // Extract group names from the results
    const groups = results.map((row) => row.group_name)

    // Check if the specified group name exists in the list of groups
    return groups.includes(groupName)
  } catch (err) {
    console.error("Error checking user group:", err)
    throw new Error("Server error")
  }
}

// Middleware to authorize based on group name
const authorizeGroup = (groupName) => {
  return async (req, res, next) => {
    const user = req.user // Assuming user details are attached by authentication middleware

    try {
      // Check if the user belongs to the specified group
      const isInGroup = await checkGroup(user.username, groupName)

      // Handle authorization for 'admin' group with additional check
      if (groupName === "admin") {
        if (isInGroup || user.username === "admin") {
          next() // User is authorized
        } else {
          res.status(403).send("Forbidden: You do not have permission")
        }
      } else {
        if (isInGroup) {
          next() // User is authorized
        } else {
          res.status(403).send("Forbidden: You do not have permission")
        }
      }
    } catch (err) {
      console.error("Error authorizing group:", err)
      res.status(500).send("Server error")
    }
  }
}

module.exports = { authenticateToken, authorizeGroup }
