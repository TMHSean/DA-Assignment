<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { checkUserGroup, checkUserStatus, getApplicationDetails } from '$lib/api'; // Assume you have an API function to get tasks

  let tasks = {
    open: [],
    toDo: [],
    doing: [],
    done: [],
    closed: []
  };
  let acronym = '';
  let isProjectManager = false;
  let isTaskCreator = false;

  onMount(async () => {
    acronym = $page.params.acronym;

    try {
      const userStatus = await checkUserStatus();
      if (userStatus) {
        // tasks = await getTasksForApplication(acronym); // Fetch tasks for the application
        isProjectManager = userStatus.isProjectManager;
        const applicationDetails = await getApplicationDetails(acronym);
        const taskCreatorGroup = applicationDetails.app_permit_create;
        const result = await checkUserGroup(taskCreatorGroup);
        isTaskCreator = result.data.isInGroup;
      } else {
        // Redirect to login if not authenticated
        goto('/');
      }
    } catch (error) {
      console.error('Error checking if user is task creator:', error);
      throw error;
    }
  });

  function viewTask(taskId) {
    // Handle view task logic
    console.log(`View task with ID: ${taskId}`);
  }

  function handleKeyPress(event, taskId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      viewTask(taskId);
    }
  }

  function goToPlans() {
    goto(`/plan/${acronym}`);
  }

  function goToTasks() {
    goto(`/createtask/${acronym}`);
  }
</script>

<div class="container">
  <div class="header-container">
    <h1>Tasks for {acronym}</h1>
    <div class="button-container">
      {#if isProjectManager && isTaskCreator}
        <button class="plan-button view-plans-button" on:click={goToPlans}>View Plans</button>
        <button class="plan-button create-tasks-button" on:click={goToTasks}>+ Create Tasks</button>
      {:else if isProjectManager}
        <button class="plan-button view-plans-button full-width" on:click={goToPlans}>View Plans</button>
      {:else if isTaskCreator}
        <button class="plan-button create-tasks-button full-width" on:click={goToTasks}>Create Tasks</button>
      {/if}
    </div>
  </div>

  <div class="tasks-container">
    <div class="column">
      <h2>Open</h2>
      {#each tasks.open as task}
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.id)} on:keypress={(event) => handleKeyPress(event, task.id)}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <p><strong>Plan:</strong> {task.planName}</p>
        </div>
      {/each}
    </div>

    <div class="column">
      <h2>To Do</h2>
      {#each tasks.toDo as task}
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.id)} on:keypress={(event) => handleKeyPress(event, task.id)}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <p><strong>Plan:</strong> {task.planName}</p>
          <button class="view-task-button" on:click|stopPropagation={() => viewTask(task.id)}>View Task</button>
        </div>
      {/each}
    </div>

    <div class="column">
      <h2>Doing</h2>
      {#each tasks.doing as task}
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.id)} on:keypress={(event) => handleKeyPress(event, task.id)}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <p><strong>Plan:</strong> {task.planName}</p>
          <button class="view-task-button" on:click|stopPropagation={() => viewTask(task.id)}>View Task</button>
        </div>
      {/each}
    </div>

    <div class="column">
      <h2>Done</h2>
      {#each tasks.done as task}
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.id)} on:keypress={(event) => handleKeyPress(event, task.id)}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <p><strong>Plan:</strong> {task.planName}</p>
        </div>
      {/each}
    </div>

    <div class="column">
      <h2>Closed</h2>
      {#each tasks.closed as task}
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.id)} on:keypress={(event) => handleKeyPress(event, task.id)}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <p><strong>Plan:</strong> {task.planName}</p>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .container {
    padding: 20px;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 2em;
    color: #333;
  }

  .button-container {
    display: flex;
    gap: 10px;
  }

  .plan-button {
    padding: 10px 20px;
    font-size: 1em;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .view-plans-button {
    background-color: #28a745;
    color: white;
    border: none;
  }

  .view-plans-button:hover {
    background-color: #218838;
  }

  .create-tasks-button {
    background-color: #007bff;
    color: white;
    border: none;
  }

  .create-tasks-button:hover {
    background-color: #0056b3;
  }

  .tasks-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  .column {
    border: 1px solid #ddd;
    border-radius: 10px;
    background-color: #f9f9f9;
    width: 22%;
    min-height: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .column h2 {
    text-align: center;
    margin-bottom: 15px;
    font-size: 1.2em;
    color: #000;
    border-bottom: 2px solid #000;
    padding-bottom: 5px;
    width: 100%;
  }

  .task-card {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    width: 100%;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    outline: none;
  }

  .task-card:focus {
    outline: 2px solid #007bff;
  }

  .task-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }

  .task-card h3 {
    margin: 0 0 5px 0;
    font-size: 1.1em;
    color: #333;
  }

  .task-card p {
    margin: 5px 0;
    color: #555;
  }

  .view-task-button {
    margin-top: 10px;
    padding: 5px 10px;
    font-size: 0.9em;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .view-task-button:hover {
    background-color: #0056b3;
  }
</style>
