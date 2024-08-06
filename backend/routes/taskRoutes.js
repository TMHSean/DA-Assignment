const express = require("express");
const router = express.Router();
const taskMgmt = require("../controllers/taskMgmt"); // Assume taskMgmt is the controller for task-related functions
const { authenticateToken, authorizeGroup } = require("../middleware/authMiddleware");

// Create a new application
router.post("/create", authenticateToken, authorizeGroup("projectlead"), taskMgmt.createApplication);

// Get all applications
router.get("/all", authenticateToken, taskMgmt.getAllApplications);

// Get a specific application by ID
router.get("/get/:acronym", authenticateToken, taskMgmt.getApplicationByAcronym);

// Update an application
router.put("/update/:acronym", authenticateToken, authorizeGroup("projectlead"), taskMgmt.updateApplication);

module.exports = router;
