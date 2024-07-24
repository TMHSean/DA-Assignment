const express = require("express")
const router = express.Router()
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware")
const GroupController = require("../controllers/groupController")

// Routes for groups - protected by token
router.post(
  "/create",
  authenticateToken,
  authorizeAdmin,
  GroupController.createGroup
)
router.post(
  "/adduser",
  authenticateToken,
  authorizeAdmin,
  GroupController.addUserToGroup
)
router.delete(
  "/removeuser",
  authenticateToken,
  authorizeAdmin,
  GroupController.removeUserFromGroup
)

router.get("/allrecords", authenticateToken, GroupController.getAllRecords)
router.get("/all", GroupController.getAllGroups)
router.get(
  "/checkusers/:groupName",
  authenticateToken,
  GroupController.getUsersInGroup
)
router.get(
  "/checkgroups/:username",
  authenticateToken,
  GroupController.checkUserGroup
)

module.exports = router
