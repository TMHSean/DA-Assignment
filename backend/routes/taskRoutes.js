const express = require("express");
const router = express.Router();
const taskMgmt = require("../controllers/taskMgmt"); // Assume taskMgmt is the controller for task-related functions
const { authenticateToken, authorizeGroup } = require("../middleware/authMiddleware");

//***** APPLICATION  */

// Create a new application
router.post("/create", authenticateToken, authorizeGroup("projectlead"), taskMgmt.createApplication);

// Get all applications
router.get("/all", authenticateToken, taskMgmt.getAllApplications);

// Get a specific application by ID
router.get("/get/:acronym", authenticateToken, taskMgmt.getApplicationByAcronym);

// Update an application
router.put("/update/:acronym", authenticateToken, authorizeGroup("projectlead"), taskMgmt.updateApplication);

//***** PLAN  */

// Create a new plan
router.post('/plans/create', authenticateToken, authorizeGroup("projectmanager"), taskMgmt.createPlan);

// Get all plans
router.get('/plans/all/:acronym', authenticateToken, taskMgmt.getAllPlans);

// Get a specific plan
router.get('/plans/get/:plan_app_acronym/:plan_mvp_name', authenticateToken, taskMgmt.getPlan);

// Update a plan
router.put('/plans/update/:plan_app_acronym/:plan_mvp_name', authenticateToken, authorizeGroup("projectmanager"), taskMgmt.updatePlan);

//***** TASK  */

// Create a new task
router.post('/createtask', authenticateToken, (req, res, next) => {
  const groupName = req.body.groupName; // Extract group name from request body
  authorizeGroup(groupName)(req, res, next); // Call authorizeGroup middleware
}, taskMgmt.createTask);


// Update a task
router.put('/update/task/:taskId', authenticateToken, (req, res, next) => {
  const groupName = req.body.groupName; // Extract group name from request body
  authorizeGroup(groupName)(req, res, next); // Call authorizeGroup middleware
}, taskMgmt.updateTask);

// Update a tasknote
router.put('/update/tasknote/:taskId', authenticateToken, (req, res, next) => {
  const groupName = req.body.groupName; // Extract group name from request body
  authorizeGroup(groupName)(req, res, next); // Call authorizeGroup middleware
}, taskMgmt.updateTaskNote);

// Update a task state
router.put('/update/taskState/:taskId', authenticateToken, (req, res, next) => {
  const groupName = req.body.groupName; // Extract group name from request body
  authorizeGroup(groupName)(req, res, next); // Call authorizeGroup middleware
}, taskMgmt.updateTaskState);

// Get a specific task by ID
router.get('/getTask/:taskId', authenticateToken, taskMgmt.getTaskById);

// Get a specific tasknotes by ID
router.get('/getTasknotes/:taskId', authenticateToken, taskMgmt.getTasknotesById);

// Get all tasks
// router.get('/all', authenticateToken, taskMgmt.getAllTasks);

// Get tasks by application acronym
router.get('/getByAcronym/:acronym', authenticateToken, taskMgmt.getTasksByAcronym);


module.exports = router;
