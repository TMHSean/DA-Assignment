require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const db = require("./config/db") // Ensure the path to db.js is correct

const app = express()
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000

// Import routes
const userRoutes = require("./routes/userRoutes")

// Use routes
app.use("/users", userRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// Check the initial connection
;(async () => {
  try {
    // Perform a simple query to check the connection
    const [rows] = await db.query("SELECT 1")
    console.log("Database connection is working.")
  } catch (err) {
    console.error("Error connecting to the database:", err)
    process.exit(1)
  }
})()
