const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { generateToken } = require("../utils/auth")
const db = require("../config/db") // Ensure the path is correct


// Handle user login
const loginUser = async (req, res) => {
  const { username, password } = req.body

  try {
    // Fetch user from the database
    const [users] = await db.query("SELECT * FROM user WHERE username = ?", [
      username,
    ])
    const user = users[0]

    if (!user) {
      // If no user found, return invalid credentials
      return res.status(401).send("Invalid username or password")
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      // If password does not match, return invalid credentials
      return res.status(401).send("Invalid username or password")
    }

    // Check if the user is disabled
    if (user.disabled === 1) {
      return res.status(403).send("User has been disabled") // Exit after sending the response
    }

    // Generate token and send response
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress
    const browser = req.headers["user-agent"]
    const token = generateToken(user, ip, browser)
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600 * 1000,
    }) // Put secure true if in production
    return res.status(200).send("Login Successful") // Exit after sending the response
  } catch (err) {
    console.error("Error logging in:", err)
    return res.status(500).send("Server error") // Exit after sending the response
  }
}

// Handle user logout (clear token)
const logoutUser = (req, res) => {
  res.clearCookie("jwt")
  res.status(200).send("Logout successful")
}

// Controller function to check user status
const checkUserStatus = async (req, res) => {
  try {
    const user = req.user; // User details from the token

    if (!user || !user.username) {
      return res.status(401).send("Unauthorized");
    }

    // Check if the user is an admin by using checkGroup function
    const isAdmin = user.username === "admin" || await checkGroup(user.username, 'admin');

    const isProjectLead = await checkGroup(user.username, 'projectlead');
    const isProjectManager = await checkGroup(user.username, 'projectmanager');

    // Retrieve user details
    const query = `
      SELECT username, email
      FROM user
      WHERE username = ?;
    `;

    // Execute query to get user details
    const [results] = await db.query(query, [user.username]);

    if (results.length > 0) {
      const dbUser = results[0];
      res.json({
        username: dbUser.username,
        isAdmin: isAdmin, // Determine admin status
        isProjectLead: isProjectLead,
        isProjectManager: isProjectManager,
        email: dbUser.email,
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.error("Error checking user status:", err);
    res.status(500).send("Server error");
  }
};

// Controller function to check if a user belongs to a specific group
const checkUserGroup = async (req, res) => {
  const user = req.user; // User details from the token
  const username = user.username;
  const { groupName } = req.query;

  if (!username || !groupName) {
    return res.status(400).json({ error: 'Username and group name are required' });
  }
  try {
    const isInGroup = await checkGroup(username, groupName);
    res.status(200).json({ isInGroup });
  } catch (error) {
    console.error("Error checking user group:", error);
    res.status(500).json({ error: "Server error occurred while checking user group" });
  }
};


// Check if a user belongs to a specific group
const checkGroup = async (username, groupName) => {
  try {
    // Query to get all group names for the user
    const [results] = await db.query(
      "SELECT group_name FROM usergroup WHERE username = ?",
      [username]
    );

    // Extract group names from the results
    const groups = results.map((row) => row.group_name);

    // Check if the specified group name exists in the list of groups
    return groups.includes(groupName);
  } catch (err) {
    console.error("Error checking user group:", err);
    throw new Error("Server error");
  }
};


module.exports = {
  loginUser,
  logoutUser,
  checkUserStatus,
  checkUserGroup
}
