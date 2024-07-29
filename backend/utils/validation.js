const UserModel = require("../models/userModel")
const GroupModel = require("../models/groupModel")
const { isAlphanumeric, isLength, isEmail } = require("validator") // Using 'validator' package for validation

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
  } else if (await UserModel.getUserByUsername(username)) {
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
  let errors = []

  // Validate group name
  if (!groupName || groupName.trim() === "") {
    errors.push("Group name cannot be empty.")
  } else if (!isLength(groupName, { min: 4, max: 20 })) {
    errors.push("Group name length must be between 4 and 20 characters.")
  } else if (!/^[a-zA-Z0-9_]+$/.test(groupName)) {
    errors.push(
      "Group name can only contain alphanumeric characters and underscores, with no spaces."
    )
  } else if (await GroupModel.groupExists(groupName)) {
    errors.push("Group name already exists.")
  }

  return errors
}

module.exports = {
  validateCreateUser,
  validateUpdateUserProfile,
  validateCreateGroup,
}
