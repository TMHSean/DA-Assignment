<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { checkUserGroup, checkUserStatus, getApplicationDetails, getTasksForApplication } from '$lib/api'; 

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
        isProjectManager = userStatus.isProjectManager;
        const applicationDetails = await getApplicationDetails(acronym);
        const taskCreatorGroup = applicationDetails.app_permit_create;
        const result = await checkUserGroup(taskCreatorGroup);
        isTaskCreator = result.data.isInGroup;

        const fetchedTasks = await getTasksForApplication(acronym);

        tasks.open = fetchedTasks.filter(task => task.task_state === 'open');
        tasks.toDo = fetchedTasks.filter(task => task.task_state === 'todo');
        tasks.doing = fetchedTasks.filter(task => task.task_state === 'doing');
        tasks.done = fetchedTasks.filter(task => task.task_state === 'done');
        tasks.closed = fetchedTasks.filter(task => task.task_state === 'closed');
        
      } else {
        goto('/deny');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });

  function viewTask(taskId) {
    goto(`/taskdetails/${acronym}/${taskId}`);
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

  function getPlanColor(plan) {
    switch (plan) {
      case 'sprint 1':
        return '#007bff'; // Blue for 'sprint 1'
      case 'sprint 2':
        return '#28a745'; // Green for 'sprint 2'
      default:
        return '#6c757d'; // Grey for default or no plan
    }
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
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.task_id)} on:keypress={(event) => handleKeyPress(event, task.task_id)}>
          <div class="task-details">
            <div class="task-color-bar" style="background-color: {getPlanColor(task.task_plan)};"></div>
            <p class="task-name"><strong>Task Name:</strong> {task.task_name}</p>
            <p class="task-description"><strong>Description:</strong> {task.task_description}</p>
            <p><strong>Plan:</strong> {task.task_plan ? task.task_plan : 'No plan selected'}</p>
          </div>
        </div>
      {/each}
    </div>

    <div class="column">
      <h2>To Do</h2>
      {#each tasks.toDo as task}
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.task_id)} on:keypress={(event) => handleKeyPress(event, task.task_id)}>
          <div class="task-details">
            <div class="task-color-bar" style="background-color: {getPlanColor(task.task_plan)};"></div>
            <p class="task-name"><strong>Task Name:</strong> {task.task_name}</p>
            <p class="task-description"><strong>Description:</strong> {task.task_description}</p>
            <p><strong>Plan:</strong> {task.task_plan ? task.task_plan : 'No plan selected'}</p>
          </div>
        </div>
      {/each}
    </div>

    <div class="column">
      <h2>Doing</h2>
      {#each tasks.doing as task}
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.task_id)} on:keypress={(event) => handleKeyPress(event, task.task_id)}>
          <div class="task-details">
            <div class="task-color-bar" style="background-color: {getPlanColor(task.task_plan)};"></div>
            <p class="task-name"><strong>Task Name:</strong> {task.task_name}</p>
            <p class="task-description"><strong>Description:</strong> {task.task_description}</p>
            <p><strong>Plan:</strong> {task.task_plan ? task.task_plan : 'No plan selected'}</p>
          </div>
        </div>
      {/each}
    </div>

    <div class="column">
      <h2>Done</h2>
      {#each tasks.done as task}
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.task_id)} on:keypress={(event) => handleKeyPress(event, task.task_id)}>
          <div class="task-details">
            <div class="task-color-bar" style="background-color: {getPlanColor(task.task_plan)};"></div>
            <p class="task-name"><strong>Task Name:</strong> {task.task_name}</p>
            <p class="task-description"><strong>Description:</strong> {task.task_description}</p>
            <p><strong>Plan:</strong> {task.task_plan ? task.task_plan : 'No plan selected'}</p>
          </div>
        </div>
      {/each}
    </div>

    <div class="column">
      <h2>Closed</h2>
      {#each tasks.closed as task}
        <div class="task-card" role="button" tabindex="0" on:click={() => viewTask(task.task_id)} on:keypress={(event) => handleKeyPress(event, task.task_id)}>
          <div class="task-details">
            <div class="task-color-bar" style="background-color: {getPlanColor(task.task_plan)};"></div>
            <p class="task-name"><strong>Task Name:</strong> {task.task_name}</p>
            <p class="task-description"><strong>Description:</strong> {task.task_description}</p>
            <p><strong>Plan:</strong> {task.task_plan ? task.task_plan : 'No plan selected'}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
.container {
  padding: 20px;
  width:100%;

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
  flex-wrap: nowrap;
  gap: 20px;
  overflow-x: auto; /* Keep horizontal scroll */
  width: 100%;
  box-sizing: border-box;
}

.column {
  flex: 1;
  min-width: 18%;
  max-width: 20%;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
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
  position: relative;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  outline: none;
  display: flex;
  flex-direction: column;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.task-color-bar {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;  /* Small width for the colored bar */
  height: 100%;
  border-radius: 0 10px 10px 0; /* Rounded edge to match the card */
}

.task-name, .task-description {
  max-height: 50px; /* Restrict the height */
  overflow-y: auto; /* Add vertical scroll if content exceeds height */
}

.task-details p {
  margin: 0;
}

.task-details p strong {
  color: #0e0e0e;
}

.task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.task-card:focus {
  outline: 2px solid #007bff;
}
</style>
