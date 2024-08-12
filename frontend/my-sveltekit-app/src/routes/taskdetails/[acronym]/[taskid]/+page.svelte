<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getTaskDetails, getTaskNotesDetails, updateTask, takeOnTask } from '$lib/api'; // Make sure these APIs are defined

  let task = {};
  let auditTrail = [];
  let newNote = '';
  let taskDetails = {};

  onMount(async () => {
    const taskId = $page.params.taskid;
    try {
      taskDetails = await getTaskDetails(taskId);
      const auditTrailData = await getTaskNotesDetails(taskId)
      console.log(auditTrailData)
      auditTrail = JSON.parse(auditTrailData.notes);
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  });

  async function handleUpdateTask() {
    try {
      const result = await updateTask(taskDetails.task_id, newNote);
      auditTrail = result.data.auditTrail; // Update the audit trail
      newNote = ''; // Clear the input field
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async function handleTakeOnTask() {
    try {
      const result = await takeOnTask(taskDetails.task_id);
      task.owner = result.data.owner; // Update the task owner
      auditTrail = result.data.auditTrail; // Update the audit trail
    } catch (error) {
      console.error('Error taking on task:', error);
    }
  }

  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString) return 'Invalid date';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true // Use 24-hour time format
    };
    
    // Format date using Intl.DateTimeFormat
    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date);
    
    // Replace the 'at' with a comma in the formatted date string
    return formattedDate.replace(" at", ', ');
  }
  
</script>

<div class="task-container">
  <h1>{taskDetails.task_name}</h1>
  <div class="task-details">
    <div class="task-info">
      <p><strong>Description:</strong> {taskDetails.task_description}</p>
      <p><strong>Task ID:</strong> {taskDetails.task_id}</p>
      <p><strong>State:</strong> {taskDetails.task_state}</p>
      <p><strong>Creator:</strong> {taskDetails.task_creator}</p>
      <p><strong>Owner:</strong> {taskDetails.task_owner || "Unassigned"}</p>
      <p><strong>Create Date:</strong> {formatDate(taskDetails.task_createDate)}</p>
      <p><strong>Plan:</strong> {taskDetails.task_plan}</p>
    </div>

    <div class="audit-trail">
      <h2>Notes</h2>
      <div class="notes">
        {#each auditTrail as log}
          <p>[System] {new Date(log.date).toLocaleString()}</p>
          <p> {log.message}</p>
        {/each}
      </div>
      <textarea bind:value={newNote} placeholder="Enter New Note"></textarea>
    </div>
  </div>

  <div class="actions">
    <button class="take-task-btn" on:click={handleTakeOnTask}>Take On Task</button>
    <button class="update-task-btn" on:click={handleUpdateTask}>Update Details</button>
    <button class="cancel-btn" on:click={() => window.history.back()}>Cancel</button>
  </div>
</div>

<style>
  .task-container {
    padding: 20px;
  }

  h1 {
    font-size: 2em;
    color: #333;
  }

  .task-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .task-info {
    width: 50%;
  }

  .audit-trail {
    width: 45%;
  }

  .notes {
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #ddd;
    background-color: #f9f9f9;
    margin-bottom: 10px;
  }

  .notes p {
    margin: 0;
    font-size: 0.9em;
    color: #555;
  }

  textarea {
    width: 100%;
    height: 50px;
    border: 1px solid #ddd;
    padding: 10px;
    font-size: 1em;
    border-radius: 5px;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .take-task-btn, .update-task-btn, .cancel-btn {
    padding: 10px 20px;
    font-size: 1em;
    border-radius: 5px;
    cursor: pointer;
  }

  .take-task-btn {
    background-color: #28a745;
    color: white;
    border: none;
  }

  .update-task-btn {
    background-color: #007bff;
    color: white;
    border: none;
  }

  .cancel-btn {
    background-color: #6c757d;
    color: white;
    border: none;
  }

  .take-task-btn:hover {
    background-color: #218838;
  }

  .update-task-btn:hover {
    background-color: #0056b3;
  }

  .cancel-btn:hover {
    background-color: #5a6268;
  }
</style>
