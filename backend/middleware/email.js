
const nodemailer = require('nodemailer');
const db = require("../config/db") // Path to your db configuration

// Helper function to fetch users in a specific group
const fetchUsersInGroup = async (groupName) => {
  try {
    const [results] = await db.query(
      "SELECT username FROM usergroup WHERE group_name = ?",
      [groupName]
    );
    return results.map((row) => row.username);
  } catch (err) {
    console.error("Error fetching users in group:", err);
    throw new Error("Server error");
  }
};

const getUserDetails = async (username) => {
  try {
    const [results] = await db.query(
      "SELECT email FROM user WHERE username = ?",
      [username]
    );
    return results.length > 0 ? results[0].email : null;
  } catch (err) {
    console.error("Error fetching user details:", err);
    throw new Error("Server error");
  }
};


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendTaskNotification = async (taskId, taskName, username, groupName) => {
  try {
    const usersInGroup = await fetchUsersInGroup(groupName);

    // Fetch emails for each user
    const emailPromises = usersInGroup.map(async (user) => {
      if (user === '-') {
        // Skip if the username is "-"
        return null;
      }

      const email = await getUserDetails(user);
      if (email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Task Completed Notification',
          html: `Dear ${username}, 
          <br><br> 
          The task "<strong>${taskName}</strong>" has been marked as done. Please review the task.
          <br><br>
          Click <a href="http://localhost:${process.env.LOCALHOST_PORT}/">here</a> to login.
          <br><br>
          Best regards,
          <br>
          Digital Academy`

        };
        return transporter.sendMail(mailOptions);
      }
    });

    // Filter out null values before sending all emails
    const validEmailPromises = (await Promise.all(emailPromises)).filter(Boolean);

    await Promise.all(validEmailPromises);
    console.log('Notifications sent successfully');
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};


module.exports = { sendTaskNotification };
