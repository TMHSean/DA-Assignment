<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getTaskDetails, getTaskNotesDetails, updateTask, takeOnTask, getAllPlans, checkUserStatus, getApplicationDetails, checkUserGroup, updateTaskState, updateTaskNote } from '$lib/api';

  let taskDetails = {};
  let auditTrail = [];
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
  let userPermissions = {};
  let feedbackMessage = '';
  let feedbackType = '';

  onMount(async () => {
  const taskId = $page.params.taskid;
  const acronym = $page.params.acronym;
  try {
    const userStatus = await checkUserStatus();
    if (userStatus) {
      const applicationDetails = await getApplicationDetails(acronym);
      
      // Fetch current task details
      taskDetails = await getTaskDetails(taskId);
      const taskState = taskDetails.task_state;

      // Retrieve the relevant permit group for the current task state
      permitGroupKey = `app_permit_${taskState}`;
      if (permitGroupKey === "app_permit_todo") {
        permitGroupKey = "app_permit_toDoList";
      }
      const userGroupCheck = await checkUserGroup(applicationDetails[permitGroupKey]);
      canUpdateTask = userGroupCheck.data.isInGroup;

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
    }
  } catch (error) {
    console.error('Error fetching task details or user permissions:', error);
  }
});


  async function handleUpdateTask() {
  try {
    if (!canUpdateTask) return;

    const taskState = taskDetails.task_state;

    // Define the update payload
    const taskUpdate = {
      description: taskDetails.task_description,
      plan: selectedPlan,
    };

    // Check if the task state is 'open' or 'doing'
    if (taskState === 'open' || taskState === 'doing') {
      // Update task description and plan if there are changes
      if (taskUpdate.description.trim() || taskUpdate.plan !== taskDetails.task_plan) {
        const taskUpdateResult = await updateTask(taskDetails.task_id, taskUpdate);
        if (taskUpdateResult) {
          console.log(taskUpdateResult.message);
          feedbackMessage = 'Task updated successfully!';
          feedbackType = 'success';
        } else {
          feedbackMessage = Array.isArray(taskUpdateResult.errors) ? taskUpdateResult.errors.join('\n') : taskUpdateResult.errors;
          feedbackType = 'error';
        }
      }
    }

    // Update task note if there is any new note
    if (newNote.trim()) {
      const tasknoteUpdateResult = await updateTaskNote(taskDetails.task_id, newNote, taskState, "user" );
      if (tasknoteUpdateResult) {
          feedbackMessage = 'Task updated successfully!';
          feedbackType = 'success';
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
    
  } catch (error) {
    console.error('Error updating task:', error);
  }
}


  async function handleTakeOnTask() {
    try {
      if (!canTakeOnTask) return;

      const result = await takeOnTask(taskDetails.task_id);
      taskDetails.owner = result.data.owner;
      auditTrail = result.data.auditTrail;
    } catch (error) {
      console.error('Error taking on task:', error);
    }
  }

  async function handleUpdateTaskState(newState) {
    try {
      const result = await updateTaskState(taskDetails.task_id, newState);
      taskDetails.task_state = newState;
      auditTrail = result.data.auditTrail;
    } catch (error) {
      console.error('Error updating task state:', error);
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

<div class="task-container">
  <h1>{taskDetails.task_name}</h1>
  {#if feedbackMessage}
    <p class="feedback-message {feedbackType}">{feedbackMessage}</p>
  {/if}
  <div class="task-details">
    <div class="task-info">
      <p><strong>Description:</strong> {#if (taskDetails.task_state === 'open' || taskDetails.task_state === 'doing') && canUpdateTask}<textarea bind:value={taskDetails.task_description} />{:else}{taskDetails.task_description}{/if}</p>
      <p><strong>Task ID:</strong> {taskDetails.task_id}</p>
      <p><strong>State:</strong> {taskDetails.task_state}</p>
      <p><strong>Creator:</strong> {taskDetails.task_creator}</p>
      <p><strong>Owner:</strong> {taskDetails.task_owner || "Unassigned"}</p>
      <p><strong>Create Date:</strong> {formatDate(taskDetails.task_createDate)}</p>
      <p><strong>Plan:</strong> {#if (taskDetails.task_state === 'open' || taskDetails.task_state === 'doing') && canUpdateTask}
        <select bind:value={selectedPlan}>
          <option value="">Select Plan</option>
          {#each availablePlans as plan}
            <option value={plan.plan_mvp_name}>{plan.plan_mvp_name}</option>
          {/each}
        </select>
        {:else}
        {taskDetails.task_plan}
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
        <br>
        <b>Enter New Note:</b>
        <textarea bind:value={newNote} placeholder="Enter New Note"></textarea>
      {:else}
        <br>
        <b>Note Entry Disabled:</b>
        <textarea placeholder="You do not have permission to enter notes" disabled></textarea>
      {/if}
    </div>
  </div>

  <div class="actions">
    {#if canTakeOnTask}
      <button class="take-task-btn" on:click={handleTakeOnTask}>Take On Task</button>
    {/if}
    {#if canUpdateTask}
      <button class="update-task-btn" on:click={handleUpdateTask}>Update Details</button>
    {/if}
    {#if canReleaseTask}
      <button class="release-task-btn" on:click={() => handleUpdateTaskState('todo')}>Release Task</button>
    {/if}
    {#if canGiveUpTask}
      <button class="give-up-task-btn" on:click={() => handleUpdateTaskState('todo')}>Give Up Task</button>
    {/if}
    {#if canCompleteTask}
      <button class="complete-task-btn" on:click={() => handleUpdateTaskState('done')}>Complete Task</button>
    {/if}
    {#if canApproveTask}
      <button class="approve-task-btn" on:click={() => handleUpdateTaskState('closed')}>Approve Task</button>
    {/if}
    {#if canRejectTask}
      <button class="reject-task-btn" on:click={() => handleUpdateTaskState('doing')}>Reject Task</button>
    {/if}
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
  max-height: 300px; /* Fixed height for scrolling */
  overflow-y: auto; /* Vertical scrolling */
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f9f9f9; /* Optional background color */
  box-sizing: border-box; /* Ensure padding and border are included in the width */
}

textarea {
  width: 100%; /* Full width minus padding and border */
  height: 30%;
  margin-top: 10px; /* Space above textarea */
  padding: 10px; /* Padding inside textarea */
  border: 1px solid #ccc; /* Border for textarea */
  border-radius: 4px; /* Rounded corners */
  box-sizing: border-box; /* Ensure padding and border are included in the width */
}

.system-note {
  background-color: #e9ecef;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

.user-note {
  background-color: #f0f8ff;
  border: 1px solid #b0c4de;
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
  margin-top: 20px;
}

button {
  margin-right: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: #fff;
  background-color: #007bff;
  cursor: pointer;
}

button.take-task-btn { background-color: #28a745; }
button.update-task-btn { background-color: #007bff; }
button.release-task-btn { background-color: #ffc107; }
button.give-up-task-btn { background-color: #dc3545; }
button.complete-task-btn { background-color: #17a2b8; }
button.approve-task-btn { background-color: #28a745; }
button.reject-task-btn { background-color: #dc3545; }
button.cancel-btn { background-color: #6c757d; }

button:disabled {
  background-color: #c6c6c6;
  cursor: not-allowed;
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

</style>
