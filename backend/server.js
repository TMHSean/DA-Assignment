require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const cors = require("cors") // Import the cors middleware
const db = require("./config/db") // Ensure the path to database.js is correct
const { authenticateToken } = require("./middleware/authMiddleware")

// Initialize Express app
const app = express()

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your SvelteKit frontend URL
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true, // Allow cookies to be sent with requests
}

app.use(cors(corsOptions)) // Use the cors middleware
app.use(bodyParser.json())
app.use(cookieParser())

const PORT = process.env.PORT || 3000

// Import routes
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const groupRoutes = require("./routes/groupRoutes")

// Use routes
app.use("/api/auth", authRoutes)
// app.use("/api/users", userRoutes)
app.use("/api/users", authenticateToken, userRoutes)
// app.use("/api/groups", groupRoutes)
app.use("/api/groups", authenticateToken, groupRoutes)

// Start the server
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
