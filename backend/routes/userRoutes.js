const express = require("express");
const router = express.Router();
const userMgmt = require("../controllers/userMgmt");
const { authenticateToken, authorizeAdmin, authorizeGroup } = require("../middleware/authMiddleware");

// Create a new user (if needed for admin purposes)
router.post("/create", authenticateToken, authorizeGroup("admin"), userMgmt.createUser);

// Get all users
router.get("/allusers", authenticateToken, authorizeGroup("admin"), userMgmt.getAllUsers);

// Other user routes with authentication
router.get("/active", authenticateToken, userMgmt.getActiveUsers);
router.get("/inactive", authenticateToken, userMgmt.getInactiveUsers);
router.put("/updateprofile/:username", authenticateToken, userMgmt.updateUser);
router.put("/update/:username", authenticateToken, authorizeGroup("admin"), userMgmt.updateUser);
router.put("/status/:username", authenticateToken, authorizeGroup("admin"), userMgmt.setUserStatus);
router.put("/disable/:username", authenticateToken, authorizeGroup("admin"), userMgmt.softDeleteUser);

// Routes for groups - protected by token
router.post("/creategroup", authenticateToken, authorizeGroup("admin"), userMgmt.createGroup);
router.post("/adduser", authenticateToken, authorizeGroup("admin"), userMgmt.addUserToGroup);
router.delete("/removeuser", authenticateToken, authorizeGroup("admin"), userMgmt.removeUserFromGroup);

router.get("/allrecords", authenticateToken, userMgmt.getAllRecords);
router.get("/allgroups", authenticateToken, userMgmt.getAllGroups);
router.get("/checkusers", authenticateToken, userMgmt.getUsersInGroup);
router.get("/retrieveusergroups", authenticateToken, userMgmt.retrieveUserGroups);

// NOT USED but placed here for checks

// ******** USER *********** //
router.get("/retrieve/:username", authenticateToken, userMgmt.getUserByUsername);
router.delete("/delete/:username", authenticateToken, authorizeGroup("admin"), userMgmt.hardDeleteUser);

// ******** GROUPS *********** //

module.exports = router;
