<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getTaskDetails, getTaskNotesDetails, updateTask, getAllPlans, checkUserStatus, getApplicationDetails, checkUserGroup, updateTaskState, updateTaskNote } from '$lib/api';

  let taskDetails = {};
  let taskState = "";
  let auditTrail = [];
  let permitGroup = "";
  let acronym = '';
  let newNote = '';
  let permitGroupKey = "";
  let canTakeOnTask = false;
  let canUpdateTask = false;
  let canReleaseTask = false;
  let canGiveUpTask = false;
  let canCompleteTask = false;
  let canApproveTask = false;
  let canRejectTask = false;
  let availablePlans = [];
  let selectedPlan = '';
  let feedbackMessage = '';
  let feedbackType = '';
  let requestForExtension = false; // New state variable
  let requestForExtensionMsg = "Request for Time Extension: ";

  onMount(async () => {
  const taskId = $page.params.taskid;
  acronym = $page.params.acronym;
  try {
    const userStatus = await checkUserStatus();
    if (userStatus) {
      const applicationDetails = await getApplicationDetails(acronym);
      // Fetch current task details
      taskDetails = await getTaskDetails(taskId);
      taskState = taskDetails.task_state;
      if (taskState !== "closed") {
        // Retrieve the relevant permit group for the current task state
        permitGroupKey = `app_permit_${taskState}`;
        if (permitGroupKey === "app_permit_todo") {
          permitGroupKey = "app_permit_toDoList";
        }
        permitGroup = applicationDetails[permitGroupKey];
        const userGroupCheck = await checkUserGroup(applicationDetails[permitGroupKey]);
        canUpdateTask = userGroupCheck.data.isInGroup;
      } else {
        canUpdateTask = false;
      }
      

      const auditTrailData = await getTaskNotesDetails(taskId);
      auditTrail = auditTrailData.map(note => ({
        ...note,
        notes: JSON.parse(note.notes)
      }));

      availablePlans = await getAllPlans(acronym);
      selectedPlan = taskDetails.task_plan;

      canTakeOnTask = taskState === 'todo' && canUpdateTask;
      canReleaseTask = taskState === 'open' && canUpdateTask;
      canGiveUpTask = taskState === 'doing' && canUpdateTask;
      canCompleteTask = taskState === 'doing' && canUpdateTask;
      canApproveTask = taskState === 'done' && canUpdateTask;
      canRejectTask = taskState === 'done' && canUpdateTask;

      console.log('Task State:', taskState);
      console.log('Can Update Task:', canUpdateTask);
    } else {
      goto('/deny'); 
    }
  } catch (error) {
    console.error('Error fetching task details or user permissions:', error);
    }
  });

  function goBack() {
    goto(`/taskpage/${acronym}`);
  }



  async function handleUpdateTask() {
    let taskUpdateSuccessful = false;
    let taskNoteUpdateSuccessful = false;
    
    try {
      if (!canUpdateTask) return;

      const taskState = taskDetails.task_state;

      // Define the update payload
      const taskUpdate = {
        description: taskDetails.task_description,
        plan: selectedPlan,
      };

      // Check if the task state is 'open' or 'doing'
      if (taskState === 'open' || taskState === 'done') {
        // Update task description and plan if there are changes
        if (taskUpdate.description.trim() || taskUpdate.plan !== taskDetails.task_plan) {
          const taskUpdateResult = await updateTask(taskDetails.task_id, taskUpdate, permitGroup);
          if (taskUpdateResult) {
            taskUpdateSuccessful = true; // Mark task update as successful
          } else {
            feedbackMessage = Array.isArray(taskUpdateResult.errors) ? taskUpdateResult.errors.join('\n') : taskUpdateResult.errors;
            feedbackType = 'error';
          }
        }
      }

      // Update task note if there is any new note
      if (newNote.trim()) {
        let noteMsg = "";
        if (requestForExtension) {
          noteMsg = requestForExtensionMsg + newNote;
        } else {
          noteMsg = newNote;
        }
        const tasknoteUpdateResult = await updateTaskNote(taskDetails.task_id, noteMsg, taskState, "user", permitGroup );
        if (tasknoteUpdateResult) {
            taskNoteUpdateSuccessful = true; // Mark task note update as successful
        } else {
            feedbackMessage = Array.isArray(tasknoteUpdateResult.errors) ? tasknoteUpdateResult.errors.join('\n') : tasknoteUpdateResult.errors;
            feedbackType = 'error';
        }
        newNote = ''; // Clear the note field after updating
      }

      // Refresh audit trail
      const auditTrailResult = await getTaskNotesDetails(taskDetails.task_id);
      auditTrail = auditTrailResult.map(note => ({
        ...note,
        notes: JSON.parse(note.notes)
      }));

      // Set the feedback message based on the results of both updates
      if (taskUpdateSuccessful && taskNoteUpdateSuccessful) {
        feedbackMessage = 'Task and note updated successfully!';
        feedbackType = 'success';
      } else if (taskUpdateSuccessful) {
        feedbackMessage = 'Task updated successfully!';
        feedbackType = 'success';
      } else if (taskNoteUpdateSuccessful) {
        feedbackMessage = 'Note updated successfully!';
        feedbackType = 'success';
      }

    } catch (error) {
      console.error('Error updating task:', error);
      feedbackMessage = Array.isArray(error.errors) ? error.errors.join('\n') : error.errors;
      feedbackType = 'error';
    }
  }


  async function handleUpdateTaskState(newState, approval=false, release=false) {
    try {
      await handleUpdateTask();
      const updateStateObject = {newState, permitGroup, approval, release}
      const result = await updateTaskState(taskDetails.task_id, updateStateObject, permitGroup);
      if (result) {
        goto(`/taskpage/${acronym}`);
      }
      
    } catch (error) {
        feedbackMessage = Array.isArray(error.errors) ? error.errors.join('\n') : error.errors;
        feedbackType = 'error';
    }
  }

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
      hour12: true
    };

    return new Intl.DateTimeFormat('en-GB', options).format(date).replace(" at", ', ');
  }
</script>

<button class="back-button" on:click={goBack}>← Back</button>

<div class="task-container">
  {#if feedbackMessage}
    <p class="feedback-message {feedbackType}">{feedbackMessage}</p>
  {/if}

  <!-- Unified container for task-info and audit-trail -->
  <div class="task-content">
    <div class="task-info">
      <p><strong>Task Name:</strong> {taskDetails.task_name}</p>
      <p><strong>Description:</strong> {#if (taskDetails.task_state === 'open' || taskDetails.task_state === 'done') && canUpdateTask}<textarea bind:value={taskDetails.task_description} />{:else}{taskDetails.task_description}{/if}</p>
      <p><strong>Task ID:</strong> {taskDetails.task_id}</p>
      <p><strong>State:</strong> {taskDetails.task_state}</p>
      <p><strong>Creator:</strong> {taskDetails.task_creator}</p>
      <p><strong>Owner:</strong> {taskDetails.task_owner || "Unassigned"}</p>
      <p><strong>Create Date:</strong> {formatDate(taskDetails.task_createDate)}</p>
      <p><strong>Plan:</strong> {#if (taskDetails.task_state === 'open' || taskDetails.task_state === 'done') && canUpdateTask}
        <select bind:value={selectedPlan}>
          <option value="No Plan selected">Select Plan</option>
          {#each availablePlans as plan}
            <option value={plan.plan_mvp_name}>{plan.plan_mvp_name}</option>
          {/each}
        </select>
        {:else}
        {(taskDetails.task_plan) ? (taskDetails.task_plan) : "No Plan selected"}
        {/if}
      </p>
    </div>

    <div class="audit-trail">
      <h2>Notes</h2>
      <div class="notes">
        {#each auditTrail as log}
          <div class={log.notes[0].type === "system" ? "system-note" : "user-note"}>
            {#each log.notes as note}
              <div class="note">
                <p class="note-header">
                  {#if log.notes[0].type === "system"}
                    [System - {note.state}]
                  {:else}
                    [{note.user} - {note.state}]
                  {/if}
                  <span class="note-date">{formatDate(note.date)}</span>
                </p>
                <p class="note-message">{note.message}</p>
              </div>
            {/each}
          </div>
          <hr class="divider" />
        {/each}
      </div>
      {#if canUpdateTask}
        <div class="notes-container">
          <div class="note-header-container">
            <b>Enter New Note:</b>
            {#if taskState === "doing"}
              <div>
                <input type="checkbox" bind:checked={requestForExtension} /> Request for Time Extension
              </div>
            {/if}
          </div>
          <textarea bind:value={newNote} placeholder="Enter New Note"></textarea>
        </div>
      {:else}
        <br>
        <b>Note Entry Disabled:</b>
        <textarea placeholder="You do not have permission to enter notes" disabled></textarea>
      {/if}
    </div>
  </div>

  <!-- Right-aligned buttons -->
  <div class="actions">
    <div class="action-buttons">
      {#if requestForExtension}
        <button class="cancel-btn" on:click={() => window.history.back()}>Cancel</button>
        {#if canCompleteTask}
          <button class="rte-task-btn" on:click={() => handleUpdateTaskState('done')}>Request for Time Extension</button>
        {/if}
      {:else}
        <button class="cancel-btn" on:click={() => window.history.back()}>Cancel</button>
        {#if canUpdateTask}
          <button class="update-task-btn" on:click={handleUpdateTask} disabled={taskState === 'done' && selectedPlan !== taskDetails.task_plan}>Update Details</button>
        {/if}
        {#if canTakeOnTask}
          <button class="take-task-btn" on:click={() => handleUpdateTaskState('doing')}>Take On Task</button>
        {/if}
        {#if canReleaseTask}
          <button class="release-task-btn" on:click={() => handleUpdateTaskState('todo', false, true)}>Release Task</button>
        {/if}
        {#if canGiveUpTask}
          <button class="give-up-task-btn" on:click={() => handleUpdateTaskState('todo')}>Give Up Task</button>
        {/if}
        {#if canCompleteTask}
          <button class="complete-task-btn" on:click={() => handleUpdateTaskState('done')}>Complete Task</button>
        {/if}
        {#if canRejectTask}
          <button class="reject-task-btn" on:click={() => handleUpdateTaskState('doing', true)}>Reject Task</button>
        {/if}
        {#if canApproveTask}
        <button class="approve-task-btn" on:click={() => handleUpdateTaskState('closed')} disabled={selectedPlan !== taskDetails.task_plan}> Approve Task </button>
        {/if}
      {/if}
      
    </div>
  </div>
</div>

<style>
  .task-container {
    padding: 20px;
    max-width: 100%;
    margin: 0 auto; /* Center align */
  }

  .task-content {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px; /* Increase space between sections */
    padding: 20px;
    border-radius: 8px;
    
  }

  .task-info {
    width: 45%; /* Slightly reduce width to allow spacing */
    margin: auto;
  }

  .task-info p {
    margin-bottom: 5%; /* Increase space below each paragraph */
    line-height: 1.6; /* Increase line height for better readability */
    font-size: 1.2em; /* Increase font size (adjust as needed) */
  }

  .task-info textarea {
    margin-bottom: 15px; /* Add space below the textarea if present */
    font-size: 1em; /* Increase font size for textarea */
  }


  .audit-trail {
    width: 48%;
    padding-bottom: 20px; /* Add space below the notes log */
  }


  .notes {
    max-height: 350px; /* Increased height */
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    border-radius: 3px;
  }

  textarea {
    width: 96%;
    height: 80px; /* Fixed height */
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  /* Color-coded notes */
  .system-note {
    background-color: #e9ecef;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
  }

  .user-note {
    background-color: #d1ecf1;
    border: 1px solid #bee5eb;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
  }

  .note {
    margin-bottom: 10px;
  }

  .note-header {
    font-weight: bold;
    color: #333;
  }

  .note-date {
    color: #888;
    font-size: 0.9em;
    margin-left: 10px;
  }

  .note-message {
    margin: 5px 0 0;
  }

  .divider {
    border: 0;
    border-top: 1px solid #ddd;
    margin: 10px 0;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .action-buttons {
    display: flex;
    gap: 10px; /* Adds space between buttons */
  }

  /* General button styles */
  button {
    margin-right: 10px;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    color: #fff;
    background-color: #007bff;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
  }

  button:hover {
    opacity: 0.9; /* Slight opacity change for all buttons on hover */
  }

  /* Specific button styles */
  button.take-task-btn {
    background-color: #28a745;
  }

  button.take-task-btn:hover {
    background-color: #218838; /* Darker green for hover effect */
  }

  button.rte-task-btn {
    background-color: #007bff;
  }

  button.rte-task-btn:hover {
    background-color: #0056b3; /* Darker blue for hover effect */
  }

  button.update-task-btn {
    background-color: #007bff;
  }

  button.update-task-btn:hover {
    background-color: #0056b3; /* Darker blue for hover effect */
  }

  button.release-task-btn {
    background-color: #28a745;
  }

  button.release-task-btn:hover {
    background-color: #218838; /* Darker green for hover effect */
  }

  button.give-up-task-btn {
    background-color: #dc3545;
  }

  button.give-up-task-btn:hover {
    background-color: #c82333; /* Darker red for hover effect */
  }

  button.complete-task-btn {
    background-color: #28a745;
  }

  button.complete-task-btn:hover {
    background-color: #218838; /* Darker green for hover effect */
  }

  button.approve-task-btn {
    background-color: #28a745;
  }

  button.approve-task-btn:hover {
    background-color: #218838; /* Darker green for hover effect */
  }

  button.reject-task-btn {
    background-color: #dc3545;
  }

  button.reject-task-btn:hover {
    background-color: #c82333; /* Darker red for hover effect */
  }

  button.cancel-btn {
    background-color: #6c757d;
  }

  button.cancel-btn:hover {
    background-color: #5a6268; /* Darker grey for hover effect */
  }

  button:disabled {
    background-color: #c6c6c6;
    cursor: not-allowed;
  }

  /* Back button styles */
  .back-button {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ccc;
    padding: 10px 20px;
    font-size: 1em;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .back-button:hover {
    background-color: #e0e0e0; /* Slightly darker grey for hover effect */
  }

  .feedback-message {
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
    width: 100%;
    box-sizing: border-box;
  }

  .feedback-message.success {
    background-color: #d4edda;
    color: #155724;
  }

  .feedback-message.error {
    background-color: #f8d7da;
    color: #721c24;
  }

  .notes-container {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Space between rows */
    margin-top: 20px; /* Add space above the notes container */
  }


  .note-header-container {
    display: flex;
    align-items: center; /* Aligns items vertically centered */
    justify-content: space-between; /* Pushes items to the ends */
  }

  .note-header-container input[type="checkbox"] {
    margin-right: 10px; /* Space between checkbox and label */
  }
</style>