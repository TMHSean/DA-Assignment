<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { createTask, getAllPlans, getApplicationDetails } from '$lib/api'; // Assume you have API functions to create a task and get plans by acronym

  let taskName = '';
  let taskDescription = '';
  let selectedPlan = '';
  let acronym = '';
  let plans = [];
  let taskCreatorGroup = "";

  let feedbackMessage = '';
  let feedbackType = '';

  onMount(async () => {
    acronym = $page.params.acronym;
    try {
      const applicationDetails = await getApplicationDetails(acronym);
      taskCreatorGroup = applicationDetails.app_permit_create;
      plans = await getAllPlans(acronym);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const taskData = {
      name: taskName,
      description: taskDescription,
      plan: selectedPlan,
      acronym: acronym
    };

    try {
      const result = await createTask(taskData, taskCreatorGroup);
      if (result.errors) {
        if (result.status === 403) {
          goto('/logout');
        } else {
          feedbackMessage = Array.isArray(result.errors) ? result.errors.join('\n') : result.errors;
          feedbackType = 'error';
        }
      } else {
        feedbackMessage = 'Task created successfully!';
        feedbackType = 'success';
        goto(`/taskpage/${acronym}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  function goBack() {
    goto(`/taskpage/${acronym}`);
  }
</script>

<button class="back-button" on:click={goBack}>← Back</button>
<h1>Create Task for <br> {acronym}</h1>

<form on:submit={handleSubmit}>
  <div class="form-group">
    <label for="taskName">Name:</label>
    <input id="taskName" type="text" bind:value={taskName} required />
  </div>
  
  <div class="form-group">
    <label for="taskDescription">Description:</label>
    <textarea id="taskDescription" class="description-textarea" bind:value={taskDescription} required></textarea>
  </div>
  
  <div class="form-group">
    <label for="selectedPlan">Plan:</label>
    <select id="selectedPlan" bind:value={selectedPlan}>
      <option value="">Select Plan</option>
      {#each plans as plan}
        <option value={plan.plan_mvp_name}>{plan.plan_mvp_name}</option>
      {/each}
    </select>
  </div>
  
  <div class="submit-button-container">
    <button type="submit">Submit</button>
  </div>

  {#if feedbackMessage}
    <p class="feedback-message {feedbackType}">{feedbackMessage}</p>
  {/if}
</form>

<style>
  h1 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 2em;
    color: #333;
  }

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
    width: auto;
  }

  .back-button:hover {
    background-color: #e0e0e0;
    border-color: #bbb;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  label {
    margin-bottom: 5px;
    font-weight: bold;
  }

  input, select {
    padding: 10px;
    font-size: 1em;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .description-textarea {
    padding: 10px;
    font-size: 1em;
    border-radius: 5px;
    border: 1px solid #ccc;
    resize: vertical; /* Allows vertical resizing */
    min-height: 150px; /* Set a minimum height for the textarea */
    width: 94.5%; /* Ensure textarea takes up the full width */
  }

  .submit-button-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px;
    font-size: 1em;
    border-radius: 5px;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.2s;
  }

  button:hover {
    background-color: #0056b3;
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
