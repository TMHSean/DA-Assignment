// Page for authenticating JWT Tokens
const { verifyToken } = require("../utils/auth")
const GroupModel = require("../models/groupModel")

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
    const userGroups = await GroupModel.checkUserGroup(user.username)
    const isAdmin = userGroups.some((group) => group.group_name === "admin")

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
