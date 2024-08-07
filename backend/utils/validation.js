const { isAlphanumeric, isLength, isEmail } = require("validator") // Using 'validator' package for validation
const db = require("../config/db") // Path to your db configuration


// Validate user creation
const validateCreateUser = async (username, password, email) => {
  let errors = []

  // Validate username
  if (!username || username.trim() === "") {
    errors.push("Username cannot be empty.")
  } else if (!isLength(username, { min: 4, max: 20 })) {
    errors.push("Username length must be between 4 and 20 characters.")
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push(
      "Username can only contain alphanumeric characters and underscores."
    )
  } else if (await getUser(username)) {
    errors.push("Username already exists.")
  }

  // Validate password
  if (!password || password.trim() === "") {
    errors.push("Password cannot be empty.")
  } else if (!isLength(password, { min: 8, max: 10 })) {
    errors.push("Password length must be between 8 and 10 characters.")
  } else if (
    !/[a-zA-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^a-zA-Z\d]/.test(password)
  ) {
    errors.push(
      "Password must contain alphanumeric characters and a special character."
    )
  }

  // Validate email
  if (!email || email.trim() === "") {
    errors.push("Email cannot be empty.")
  } else if (!isEmail(email)) {
    errors.push("Email must be a valid email address.")
  }

  return errors
}

const validateUpdateUserProfile = (password, email) => {
  let errors = []

  // Validate password
  if (password && password.trim() === "") {
    errors.push("Password cannot be empty.")
  } else if (password && !isLength(password, { min: 8, max: 10 })) {
    errors.push("Password length must be between 8 and 10 characters.")
  } else if (
    password &&
    (!/[a-zA-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^a-zA-Z\d]/.test(password))
  ) {
    errors.push(
      "Password must contain alphanumeric characters and a special character."
    )
  }

  // Validate email
  if (!email || email.trim() === "") {
    errors.push("Email cannot be empty.")
  } else if (!isEmail(email)) {
    errors.push("Email must be a valid email address.")
  }

  return errors
}

// Validate group creation
const validateCreateGroup = async (groupName) => {
  let errors = [];
  // Validate group name
  if (!groupName || groupName.trim() === "") {
    errors.push("Group name cannot be empty.");
  } else if (!isLength(groupName, { min: 4, max: 20 })) {
    errors.push("Group name length must be between 4 and 20 characters.");
  } else if (!/^[a-zA-Z0-9_]+$/.test(groupName)) {
    errors.push(
      "Group name can only contain alphanumeric characters and underscores, with no spaces."
    );
  } else if (await groupExists(groupName)) {
    errors.push("Group name already exists.");
  }

  return errors;
};

const validateCreateApplication = async (acronym) => {
  let errors = [];

  // Validate acronym
  if (!acronym || acronym.trim() === "") {
    errors.push("Acronym cannot be empty.");
  } else if (!isLength(acronym, { min: 4, max: 20 })) {
    errors.push("Acronym length must be between 4 and 20 characters.");
  } else if (!/^[a-zA-Z0-9_]+$/.test(acronym)) {
    errors.push("Acronym can only contain alphanumeric characters and underscores.");
  } else if (await checkApplication(acronym)) {
    errors.push("Acronym already exists.");
  }

  return errors;
};

const validateCreatePlan = async (planAppAcronym, planMvpName) => {
  let errors = [];

  // Validate MVP name
  if (!planMvpName || planMvpName.trim() === "") {
    errors.push("MVP name cannot be empty.");
  } else if (!isLength(planMvpName, { min: 4, max: 20 })) {
    errors.push("MVP name length must be between 4 and 20 characters.");
  } else if (!/^[a-zA-Z0-9_]+$/.test(planMvpName)) {
    errors.push("MVP name can only contain alphanumeric characters and underscores.");
  } else if (await checkPlan(planAppAcronym, planMvpName)) {
    errors.push("MVP name already exists for this application.");
  }

  return errors;
};



//**** HELPER FUNCTIONS */

// Get specific user
const getUser = async (username) => {
  try {
    const [results] = await db.query("SELECT * FROM user WHERE username = ?", [username]);
    if (results.length > 0) {
      return results[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Database error occurred while fetching the user");
  }
};


//function to check if group exists
const groupExists = async (groupName) => {
  try {
    const [results] = await db.query(
      "SELECT COUNT(*) AS count FROM usergroup WHERE LOWER(group_name) = LOWER(?)",
      [groupName]
    )
    if (results.length > 0) {
      return results[0].count > 0
    } else {
      return false
    }
  } catch (err) {
    console.error("Error checking group existence:", err)
  }
}

// Get a specific application by Acronym
const checkApplication = async (acronym) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM application WHERE LOWER(app_acronym) = LOWER(?)",
      [acronym]
    );

    if (results.length > 0) {
      return results[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching application:", error);
    throw new Error("Database error occurred while fetching the application");
  }
};

// Get a specific plan by Acronym and MVP Name
const checkPlan = async (planAppAcronym, planMvpName) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM plan WHERE LOWER(plan_app_acronym) = LOWER(?) AND LOWER(plan_mvp_name) = LOWER(?)",
      [planAppAcronym, planMvpName]
    );

    if (results.length > 0) {
      return results[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching plan:", error);
    throw new Error("Database error occurred while fetching the plan");
  }
};

module.exports = {
  validateCreateUser,
  validateUpdateUserProfile,
  validateCreateGroup,
  validateCreateApplication,
  validateCreatePlan
}
