const db = require("../config/db"); // Assuming you have a db module to handle SQL queries
const { validateCreateApplication } = require('../utils/validation');

// Create a new application
const createApplication = async (req, res) => {
  const { acronym, description, rnumber, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone } = req.body;
  const lowerAcronym = acronym.toLowerCase();

  // Validate inputs
  const errors = await validateCreateApplication(acronym);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const connection = await db.getConnection(); // Get a connection from the pool
  try {
    await connection.beginTransaction();

    const result = await connection.query(
      "INSERT INTO application (app_acronym, app_description, app_rnumber, app_startDate, app_endDate, app_permit_create, app_permit_open, app_permit_toDoList, app_permit_doing, app_permit_done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [lowerAcronym, description, rnumber, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone]
    );

    await connection.commit();
    res.status(201).json({ message: "Application created successfully" });
  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).json({ errors: "Database error occurred while creating application" });
  } finally {
    connection.release();
  }
};

// Get all applications
const getAllApplications = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM application");
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ errors: "Database error occurred while fetching applications" });
  }
};

// Get a specific application by ID
const getApplicationByAcronym = async (req, res) => {
  const { acronym } = req.params;
  try {
    const [result] = await db.query("SELECT * FROM application WHERE app_acronym = ?", [acronym]);
    if (result.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ errors: "Database error occurred while fetching the application" });
  }
};

// Update an application
const updateApplication = async (req, res) => {
  const { acronym } = req.params;
  const lowerAcronym = acronym.toLowerCase();
  const { description, rnumber, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone } = req.body;

  const connection = await db.getConnection(); // Get a connection from the pool
  try {
    await connection.beginTransaction();

    const result = await connection.query(
      "UPDATE application SET app_description = ?, app_rnumber = ?, app_startDate = ?, app_endDate = ?, app_permit_create = ?, app_permit_open = ?, app_permit_toDoList = ?, app_permit_doing = ?, app_permit_done = ? WHERE app_acronym = ?",
      [description, rnumber, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone, lowerAcronym]
    );

    await connection.commit();
    res.status(200).json({ message: "Application updated successfully" });
  } catch (error) {
    console.log(error)
    await connection.rollback();
    res.status(500).json({ errors: "Database error occurred while updating the application" });
  } finally {
    connection.release();
  }
};


const createPlan = async (req, res) => {
  const { mvpName, startDate, endDate, acronym } = req.body;
  console.log("HI 1")
  console.log(mvpName)
  console.log(acronym)
  // Validate inputs (add your own validation logic if necessary)
  if (!mvpName) {
    return res.status(400).json({ errors: "MVP name is required." });
  } else if (!acronym) {
    return res.status(400).json({ errors: "Couldn't retrieve app acronym." });
  }

  const connection = await db.getConnection(); // Get a connection from the pool
  try {
    await connection.beginTransaction();
    const result = await connection.query(
      "INSERT INTO plan (plan_mvp_name, plan_startDate, plan_endDate, plan_app_acronym) VALUES (?, ?, ?, ?)",
      [mvpName, startDate, endDate, acronym]
    );
    await connection.commit();
    res.status(201).json({ message: "Plan created successfully" });
  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).json({ errors: "Database error occurred while creating plan" });
  } finally {
    connection.release();
  }
};

// Get all plans for a specific application
const getAllPlans = async (req, res) => {
  const { acronym } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM plan WHERE plan_app_acronym = ?", [acronym]);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ errors: "Database error occurred while fetching plans" });
  }
};

const getPlan = async (req, res) => {
  const { plan_app_acronym, plan_mvp_name } = req.params;
  try {
    const [result] = await db.query(
      "SELECT * FROM plan WHERE plan_app_acronym = ? AND plan_mvp_name = ?",
      [plan_app_acronym, plan_mvp_name]
    );
    if (result.length === 0) {
      return res.status(404).json({ errors: "Plan not found" });
    }
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ errors: "Database error occurred while fetching the plan" });
  }
};

const updatePlan = async (req, res) => {
  const { plan_app_acronym, plan_mvp_name } = req.params;
  const { startDate, endDate } = req.body;

  const connection = await db.getConnection(); // Get a connection from the pool
  try {
    await connection.beginTransaction();

    const result = await connection.query(
      "UPDATE plan SET plan_startDate = ?, plan_endDate = ? WHERE plan_app_acronym = ? AND plan_mvp_name = ?",
      [startDate, endDate, plan_app_acronym, plan_mvp_name]
    );

    await connection.commit();
    res.status(200).json({ message: "Plan updated successfully" });
  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).json({ errors: "Database error occurred while updating the plan" });
  } finally {
    connection.release();
  }
};

module.exports = { updatePlan };



module.exports = {
  createApplication,
  getAllApplications,
  getApplicationByAcronym,
  updateApplication,
  createPlan,
  getAllPlans,
  getPlan,
  updatePlan
};
