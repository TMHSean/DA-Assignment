<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getAllPlans } from '$lib/api'; // Assume you have an API function to get plans

  let plans = [];
  let acronym = '';

  onMount(async () => {
    acronym = $page.params.acronym;
    plans = await getAllPlans(acronym); // Fetch plans for the application
  });

  function createPlan() {
    goto(`/createplan/${acronym}`);
  }

  function editPlan(plan) {
    goto(`/editplan/${acronym}/${plan.plan_mvp_name}`);
  }

  function goBack() {
    goto(`/taskpage/${acronym}`);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Split at 'T' to get only the date part
  };
</script>

<button class="back-button" on:click={goBack}>← Back</button>
<h1>Plans for <br> {acronym}</h1>

<div class="button-container">
  <button class="create-plan-button" on:click={createPlan}>+ Create Plan</button>
</div>

<div class="plans-container">
  {#each plans as plan}
    <div class="plan-card">
      <h3>{plan.plan_mvp_name}</h3>
      <p><strong>Plan Start Date:</strong> {formatDate(plan.plan_startDate)}</p>
      <p><strong>Plan End Date:</strong> {formatDate(plan.plan_endDate)}</p>
      <button class="edit-plan-button" on:click={() => editPlan(plan)}>Edit</button>
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
    border: 1px solid #ccc; /* Add a border */
    padding: 10px 20px;
    font-size: 1em;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px; /* Add margin to move it lower */
    transition: background-color 0.2s, border-color 0.2s;
    width: auto; /* Auto width */
  }

  .back-button:hover {
    background-color: #e0e0e0;
    border-color: #bbb; /* Darker border on hover */
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
    width: 100%; /* Make the button as wide as the container */
    max-width: 800px; /* Set a max width for the button */
  }

  .create-plan-button:hover {
    background-color: #0056b3;
  }

  .plans-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    align-items: center; /* Center align the items */
    max-width: 800px; /* Set a max width for the container */
    margin: 0 auto; /* Center the container */
  }

  .plan-card {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    width: 100%; /* Make the plan card as wide as the container */
    max-width: 800px; /* Set a max width for the plan card */
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
</style>
