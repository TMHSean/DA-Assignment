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

const authorizeAdmin = async (req, res, next) => {
  const user = req.user // Assuming user details are attached by authentication middleware

  try {
    // SQL query to check if user is in the "admins" group
    const query = `
      SELECT group_name 
      FROM usergroup 
      WHERE username = ?;
    `

    // Execute query
    const [results] = await db.query(query, [user.username])

    // Extract group names from results
    const userGroups = results.map((row) => row.group_name)

    // Check if 'admins' is in the array of group names
    const isAdmin = userGroups.includes("admins")

    // Check if user is an admin or has the username "admin"
    if (isAdmin || user.username === "admin") {
      next() // User is authorized
    } else {
      res.status(403).send("Forbidden: You do not have permission")
    }
  } catch (err) {
    console.error("Error authorizing admin:", err)
    res.status(500).send("Server error")
  }
}

module.exports = { authenticateToken, authorizeAdmin }
