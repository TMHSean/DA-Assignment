const express = require("express")
const app = express()
const PORT = 3000

app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from Node.js backend!" })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
