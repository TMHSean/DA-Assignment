const express = require("express")
const router = express.Router()
const db = require("../config/db") // Adjust the path to the db.js

// Create a new user
router.post("/create", (req, res) => {
  const { username, password, email, disabled = 0 } = req.body

  // Check if the username already exists
  db.query(
    "SELECT * FROM user WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Error checking username:", err)
        res.status(500).send("Server error")
        return
      }

      if (results.length > 0) {
        // Username already exists
        res.status(400).send("Username already exists")
        return
      }

      // Insert the new user
      db.query(
        "INSERT INTO user (username, password, email, disabled) VALUES (?, ?, ?, ?)",
        [username, password, email, disabled],
        (err, results) => {
          if (err) {
            console.error("Error inserting user:", err)
            res.status(500).send("Server error")
            return
          }
          res.status(201).send({ id: results.insertId })
        }
      )
    }
  )
})

// Get all users
router.get("/", (req, res) => {
  db.query("SELECT * FROM user WHERE disabled IS 0", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err)
      res.status(500).send("Server error")
      return
    }
    res.send(results)
  })
})

// Get all active users
router.get("/", (req, res) => {
  db.query("SELECT * FROM user WHERE disabled IS 0", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err)
      res.status(500).send("Server error")
      return
    }
    res.send(results)
  })
})

// Get all inactive users
router.get("/", (req, res) => {
  db.query("SELECT * FROM user WHERE disabled IS 1", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err)
      res.status(500).send("Server error")
      return
    }
    res.send(results)
  })
})

// Get specific user
router.get("/:id", (req, res) => {
  const { id } = req.params
  db.query("SELECT * FROM user WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err)
      res.status(500).send("Server error")
      return
    }
    if (results.length === 0) {
      res.status(404).send("User not found")
      return
    }
    res.send(results[0])
  })
})

// Update user details (password and/or email)
router.put("/update/:id", (req, res) => {
  const { id } = req.params
  const { password, email } = req.body

  // Validate input
  if (!password && !email) {
    return res
      .status(400)
      .send("At least one field (password or email) is required to update.")
  }

  // Build query and parameters dynamically
  let query = "UPDATE user SET"
  const params = []

  if (password) {
    query += " password = ?,"
    params.push(password)
  }
  if (email) {
    query += " email = ?,"
    params.push(email)
  }
  // Remove trailing comma and add WHERE clause
  query = query.slice(0, -1) + " WHERE id = ?"
  params.push(id)

  console.log(query)

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error updating user:", err)
      res.status(500).send("Server error")
      return
    }
    res.send("User updated successfully")
  })
})

// Set user active or inactive
router.put("/status/:id", (req, res) => {
  const { id } = req.params
  const { disabled } = req.body

  // Validate input
  if (typeof disabled !== "number" || (disabled !== 0 && disabled !== 1)) {
    return res
      .status(400)
      .send("Disabled status must be 0 (active) or 1 (inactive).")
  }

  db.query(
    "UPDATE user SET disabled = ? WHERE id = ?",
    [disabled, id], // Use the provided disabled value (0 or 1)
    (err, results) => {
      if (err) {
        console.error("Error updating user status:", err)
        res.status(500).send("Server error")
        return
      }
      res.send(
        `User ${disabled === 1 ? "deactivated" : "activated"} successfully`
      )
    }
  )
})

// Soft delete a user
router.put("/disable/:id", (req, res) => {
  const { id } = req.params
  db.query(
    "UPDATE user SET disabled = 1 WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error disabling user:", err)
        res.status(500).send("Server error")
        return
      }
      res.send("User disabled successfully")
    }
  )
})

// Hard delete a user (only for testing purposes)
router.delete("/:id", (req, res) => {
  const { id } = req.params
  db.query("DELETE FROM user WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error deleting user:", err)
      res.status(500).send("Server error")
      return
    }
    res.send("User deleted successfully")
  })
})

module.exports = router
