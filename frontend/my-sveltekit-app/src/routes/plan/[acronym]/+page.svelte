<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getAllPlans, updatePlan } from '$lib/api'; // Assume you have an API function to get and update plans

  let plans = [];
  let acronym = '';
  let editingPlan = null;
  let feedbackMessage = '';
  let feedbackType = '';

  onMount(async () => {
    acronym = $page.params.acronym;
    plans = await getAllPlans(acronym); // Fetch plans for the application
  });

  function createPlan() {
    goto(`/createplan/${acronym}`);
  }

  function startEditing(plan) {
    editingPlan = { ...plan };
    editingPlan.plan_startDate = formatDate(editingPlan.plan_startDate);
    editingPlan.plan_endDate = formatDate(editingPlan.plan_endDate);
  }

  function cancelEditing() {
    editingPlan = null;
  }

  async function savePlan() {
    const { plan_mvp_name, plan_startDate, plan_endDate } = editingPlan;
    const planData = {
      startDate: plan_startDate,
      endDate: plan_endDate
    };

    try {
      const result = await updatePlan(acronym, plan_mvp_name, planData);
      if (result.errors) {
        feedbackMessage = Array.isArray(result.errors) ? result.errors.join('\n') : result.errors;
        feedbackType = 'error';
      } else {
        feedbackMessage = 'Plan updated successfully!';
        feedbackType = 'success';
        plans = await getAllPlans(acronym); // Refresh plans
        editingPlan = null;
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      feedbackMessage = 'Error updating plan.';
      feedbackType = 'error';
    }
  }

  function goBack() {
    goto(`/taskpage/${acronym}`);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(date - timezoneOffset).toISOString().split('T')[0];
    return localISOTime;
  };
</script>

<button class="back-button" on:click={goBack}>← Back</button>
<h1>Plans for <br> {acronym}</h1>

<div class="button-container">
  <button class="create-plan-button" on:click={createPlan}>+ Create Plan</button>
</div>

{#if feedbackMessage}
  <p class="feedback-message {feedbackType}">{feedbackMessage}</p>
{/if}

<div class="plans-container">
  {#each plans as plan}
    <div class="plan-card">
      <h3>{plan.plan_mvp_name}</h3>
      <p><strong>Plan Start Date:</strong> 
        {#if editingPlan && editingPlan.plan_mvp_name === plan.plan_mvp_name}
          <input type="date" bind:value={editingPlan.plan_startDate} />
        {:else}
          {formatDate(plan.plan_startDate)}
        {/if}
      </p>
      <p><strong>Plan End Date:</strong> 
        {#if editingPlan && editingPlan.plan_mvp_name === plan.plan_mvp_name}
          <input type="date" bind:value={editingPlan.plan_endDate} />
        {:else}
          {formatDate(plan.plan_endDate)}
        {/if}
      </p>
      {#if editingPlan && editingPlan.plan_mvp_name === plan.plan_mvp_name}
        <div class="button-group">
          <button class="save-button" on:click={savePlan}>Save</button>
          <button class="cancel-button" on:click={cancelEditing}>Cancel</button>
        </div>
      {:else}
        <button class="edit-plan-button" on:click={() => startEditing(plan)}>Edit</button>
      {/if}
    </div>
  {/each}
</div>

<style>
  h1 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 2em;
    color: #333;
  }

  .button-container {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 20px;
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

  .create-plan-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1em;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
    width: 100%;
    max-width: 800px;
  }

  .create-plan-button:hover {
    background-color: #0056b3;
  }

  .plans-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    align-items: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .plan-card {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 800px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .form-group label {
    margin-bottom: 5px;
    font-weight: bold;
  }

  .form-group input {
    padding: 10px;
    font-size: 1em;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .save-button, .cancel-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    font-size: 1em;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
    width: 80px;
  }

  .save-button:hover, .cancel-button:hover {
    background-color: #0056b3;
  }

  .edit-plan-button {
    align-self: flex-end;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .edit-plan-button:hover {
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
    max-width: 800px;
    margin: 0 auto 20px auto;
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
