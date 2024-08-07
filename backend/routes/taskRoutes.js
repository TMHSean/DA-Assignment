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


// Create a new plan
router.post('/plans/create', authenticateToken, authorizeGroup("projectlead"), taskMgmt.createPlan);

// Get all plans
router.get('/plans/all/:acronym', authenticateToken, taskMgmt.getAllPlans);

// Get a specific plan
router.get('/plans/get/:plan_app_acronym/:plan_mvp_name', authenticateToken, taskMgmt.getPlan);

// Update a plan
router.put('/plans/update/:plan_app_acronym/:plan_mvp_name', authenticateToken, authorizeGroup("projectlead"), taskMgmt.updatePlan);

module.exports = router;
