const db = require("../config/db"); // Assuming you have a db module to handle SQL queries
const { validateCreateApplication, validateCreatePlan } = require('../utils/validation');
const { sendTaskNotification } = require("../middleware/email")
// const { checkGroup } = require("../middleware/authMiddleware")


// Check if a user belongs to a specific group
const checkGroup = async (username, groupName) => {
  try {
    // Query to get all group names for the user
    const [results] = await db.query(
      "SELECT group_name FROM usergroup WHERE username = ?",
      [username]
    )

    // Extract group names from the results
    const groups = results.map((row) => row.group_name)

    // Check if the specified group name exists in the list of groups
    return groups.includes(groupName)
  } catch (err) {
    console.error("Error checking user group:", err)
    throw new Error("Server error")
  }
}

// Create a new application
const createApplication = async (req, res) => {
  const { acronym, description, rnumber, startDate, endDate, permitCreate, permitOpen, permitToDo, permitDoing, permitDone } = req.body;
  const lowerAcronym = acronym.toLowerCase();

  // Validate inputs
  const errors = await validateCreateApplication(acronym);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Validate description length
  if (description.length > 500) {
    return res.status(400).json({ errors: "Description cannot exceed 500 characters" });
  }

  if (rnumber < 0) {
    return res.status(400).json({ errors: "Rnumber cannot be a negative number" });
  }

  if (startDate > endDate) {
    return res.status(400).json({ errors: "End Date cannot be earlier than Start Date" });
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

  if (startDate > endDate) {
    return res.status(400).json({ errors: "End Date cannot be earlier than Start Date" });
  }

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

  // Validate inputs
  const errors = await validateCreatePlan(acronym, mvpName);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (startDate > endDate) {
    return res.status(400).json({ errors: "End Date cannot be earlier than Start Date" });
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

  if (startDate > endDate) {
    return res.status(400).json({ errors: "End Date cannot be earlier than Start Date" });
  }

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

const createTask = async (req, res) => {
  const { name, description, plan, acronym } = req.body;

  // Validate inputs
  if (!name || !acronym) {
    return res.status(400).json({ errors: "Name and acronym are required." });
  }

  const connection = await db.getConnection(); // Get a connection from the pool
  try {
    await connection.beginTransaction();

    // Retrieve the application rnumber and increment it
    const [appResult] = await connection.query(
      "SELECT app_rnumber FROM application WHERE app_acronym = ?",
      [acronym]
    );

    if (appResult.length === 0) {
      throw new Error("Application not found.");
    }

    const newRNumber = appResult[0].app_rnumber + 1;

    // Update the rnumber in the application table
    await connection.query(
      "UPDATE application SET app_rnumber = ? WHERE app_acronym = ?",
      [newRNumber, acronym]
    );

    // Create task_id using app_acronym and new rnumber
    const taskId = `${acronym}_${newRNumber}`;

    // Get the current date and time in local format
    const currentDate = new Date();
    // Add 1 second to the current time
    const formattedDate = currentDate.getFullYear() + '-' +
      ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' +
      ('0' + currentDate.getDate()).slice(-2) + ' ' +
      ('0' + currentDate.getHours()).slice(-2) + ':' +
      ('0' + currentDate.getMinutes()).slice(-2) + ':' +
      ('0' + currentDate.getSeconds()).slice(-2);

    // Use null if plan is not provided
    const taskPlan = plan || null;

    // Insert new task into the task table
    await connection.query(
      "INSERT INTO task (task_id, task_name, task_description, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [taskId, name, description, taskPlan, acronym, 'open', req.user.username, req.user.username, formattedDate]
    );

    // Create initial audit trail entry
    const initialNote = `User ${req.user.username} has created the task.`;
    const messageInitiator = "system";
    const auditTrail = JSON.stringify([{ user: req.user.username, state: 'open', date: formattedDate, message: initialNote, type: messageInitiator }]);
    await connection.query(
      "INSERT INTO tasknote (task_id, tasknote_created, notes) VALUES (?, ?, ?)",
      [taskId, formattedDate, auditTrail]
    );

    await connection.commit();
    res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).json({ errors: "Database error occurred while creating task" });
  } finally {
    connection.release();
  }
};





// Update a task
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { description, plan } = req.body;

  // Ensure at least one field is provided
  if (description === undefined && plan === undefined) {
    return res.status(400).json({ errors: 'At least one field (description or plan) is required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if task exists
    const [task] = await connection.query('SELECT * FROM task WHERE task_id = ?', [taskId]);
    if (task.length === 0) {
      return res.status(404).json({ errors: 'Task not found' });
    }

    const currentTaskState = task[0].task_state;

    if (currentTaskState === "open" || currentTaskState === "done") {
      // Create an array to hold values for the query
      const values = [];
      let query = "UPDATE task SET";

      if (description !== undefined) {
        query += " task_description = ?";
        values.push(description);
      }

      if (plan !== undefined) {
        // Append a comma if there are already values in the array
        if (values.length > 0) {
          query += ",";
        }
        query += " task_plan = ?";
        values.push(plan);
      }

      // Add the WHERE clause to the query
      query += " WHERE task_id = ?";
      values.push(taskId);

      const [result] = await connection.query(query, values);
      await connection.commit();

      if (result.affectedRows === 0) {
        return res.status(404).json({ errors: "Task not found" });
      }
      res.status(200).json({ errors: "Task updated successfully" });
    } else {
      res.status(200).json({ errors: "Not allowed to update at current task state" });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    await connection.rollback();
    res.status(500).json({ errors: "Database error occurred while updating task" });
  } finally {
    connection.release();
  }
};

// Update task note
const updateTaskNote = async (req, res) => {
  const { taskId } = req.params;
  const user = req.user.username;
  const { note, state = 'open', type = 'system', groupName } = req.body;

  const isPermitted = checkGroup(user, groupName)

  if (!note) {
    return res.status(400).json({ errors: 'Note content is required.' });
  }


  if (isPermitted) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Get the current date and time in local format
      const currentDate = new Date();
      const formattedDate = currentDate.getFullYear() + '-' +
        ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + currentDate.getDate()).slice(-2) + ' ' +
        ('0' + currentDate.getHours()).slice(-2) + ':' +
        ('0' + currentDate.getMinutes()).slice(-2) + ':' +
        ('0' + currentDate.getSeconds()).slice(-2);

      // Create a new note entry
      const auditTrail = JSON.stringify([{ user: req.user.username, state, date: formattedDate, message: note, type }]);

      await connection.query(
        "INSERT INTO tasknote (task_id, tasknote_created, notes) VALUES (?, ?, ?)",
        [taskId, formattedDate, auditTrail]
      );

      await connection.commit();
      res.status(201).json({ message: "Note added successfully" });
    } catch (error) {
      console.error("Error updating task note:", error);
      await connection.rollback();
      res.status(500).json({ errors: "Database error occurred while adding note" });
    } finally {
      connection.release();
    }
  } else {
    res.status(400).json({ errors: "You do not have the right to add notes" });
  }

};


const updateTaskState = async (req, res) => {
  const { taskId } = req.params;
  const { newState, groupName, approval, release } = req.body;
  const validStates = ['open', 'todo', 'doing', 'done', 'closed'];
  if (!validStates.includes(newState)) {
    return res.status(400).json({ errors: 'Invalid new state' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if task exists
    const [task] = await connection.query('SELECT * FROM task WHERE task_id = ?', [taskId]);
    if (task.length === 0) {
      return res.status(404).json({ errors: 'Task not found' });
    }

    const currentTaskState = task[0].task_state;

    if (
      ((currentTaskState === "open" || currentTaskState == "doing") && newState === "todo") ||
      ((currentTaskState === "todo" || currentTaskState === "done") && newState === "doing") ||
      (currentTaskState === "doing" && newState === "done") ||
      (currentTaskState === "done" && newState === "closed")
    ) {
      // Update task state
      await connection.query('UPDATE task SET task_state = ?, task_owner = ? WHERE task_id = ?', [newState, req.user.username, taskId]);

      // Get the current date and time in local format
      const currentDate = new Date();
      currentDate.setSeconds(currentDate.getSeconds() + 1);
      const formattedDate = currentDate.getFullYear() + '-' +
        ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + currentDate.getDate()).slice(-2) + ' ' +
        ('0' + currentDate.getHours()).slice(-2) + ':' +
        ('0' + currentDate.getMinutes()).slice(-2) + ':' +
        ('0' + currentDate.getSeconds()).slice(-2);

      // Determine the state change message
      const stateChangeMessage = (() => {
        switch (newState) {
          case 'doing':
            if (approval) {
              return `Task rejected by ${req.user.username}`;
            }
            return `Task taken on by ${req.user.username}`;

          case 'todo':
            if (release) {
              return `Task released by ${req.user.username}`;
            }
            return `Task given up by ${req.user.username}`;

          case 'done':
            return `Task submitted by ${req.user.username}`;

          case 'closed':
            return `Task closed by ${req.user.username}`;

          default:
            return `Task state changed to ${newState} by ${req.user.username}`;
        }
      })();

      const messageInitiator = 'system'; // Use 'user' if needed based on who initiates the action

      // Insert the new note
      await connection.query(
        'INSERT INTO tasknote (task_id, tasknote_created, notes) VALUES (?, ?, ?)',
        [taskId, formattedDate, JSON.stringify([{ user: req.user.username, state: newState, date: formattedDate, message: stateChangeMessage, type: messageInitiator }])]
      );

      // Commit the transaction
      await connection.commit();

      // Send notification if the new state is 'done'
      if (newState === 'done') {
        const taskName = task[0].task_name; // Assuming task_name is a field in your task table
        await sendTaskNotification(taskId, taskName, req.user.username, groupName);
      }

      res.status(200).json({ errors: 'Task state updated successfully' });
    } else {
      res.status(400).json({ errors: 'Invalid task state.' });
    }

  } catch (error) {
    console.error('Error updating task state:', error);
    await connection.rollback();
    res.status(500).json({ errors: 'Database error occurred while updating task state' });
  } finally {
    connection.release();
  }
};

// Get a specific task by ID
const getTaskById = async (req, res) => {
  const { taskId } = req.params;
  try {
    const [result] = await db.query("SELECT * FROM task WHERE task_id = ?", [taskId]);
    if (result.length === 0) {
      return res.status(404).json({ errors: "Task not found" });
    }
    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ errors: "Database error occurred while fetching task" });
  }
};

// Get a specific task by ID along with ordered related records (e.g., task notes)
const getTasknotesById = async (req, res) => {
  const { taskId } = req.params;
  try {
    // Fetch the specific task
    const [taskResult] = await db.query("SELECT * FROM task WHERE task_id = ?", [taskId]);
    if (taskResult.length === 0) {
      return res.status(404).json({ errors: "Task not found" });
    }

    // Fetch related records (e.g., task notes) ordered by date
    const [notesResult] = await db.query("SELECT * FROM tasknote WHERE task_id = ? ORDER BY tasknote_created DESC", [taskId]);

    // // Combine the task details with ordered notes
    // const task = taskResult[0];
    // task.notes = notesResult; // Assuming you want to include related notes
    res.status(200).json(notesResult);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ errors: "Database error occurred while fetching task" });
  }
};

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM task");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ errors: "Database error occurred while fetching tasks" });
  }
};

// Get tasks by application acronym
const getTasksByAcronym = async (req, res) => {
  const { acronym } = req.params;

  try {
    const [results] = await db.query(`
      SELECT task_id, task_name, task_description, task_plan, task_state FROM task WHERE task_app_acronym = ?`, [acronym]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ errors: "Database error occurred while fetching tasks" });
  }
};

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationByAcronym,
  updateApplication,
  createPlan,
  getAllPlans,
  getPlan,
  updatePlan,
  createTask,
  updateTask,
  getTaskById,
  getAllTasks,
  getTasksByAcronym,
  getTasknotesById,
  updateTaskState,
  updateTaskNote
};
