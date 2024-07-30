//Utility functions related to JWT Token generation and verification

const jwt = require("jsonwebtoken")

const SECRET_KEY = process.env.JWT_SECRET // Replace with your actual secret key

function generateToken(user, ip, browser) {
  const payload = {
    username: user.username,
    starttime: Date.now(),
    ip,
    browser,
  }
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY)
  } catch (err) {
    return null
  }
}

module.exports = { generateToken, verifyToken }
