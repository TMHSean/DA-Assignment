const { verifyToken } = require("../utils/auth")

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

module.exports = { authenticateToken }
