<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { checkUserStatus, createPlan } from '$lib/api'; // Assume you have an API function to create a plan

  let planMvpName = '';
  let startDate = '';
  let endDate = '';
  let acronym = '';
  let isProjectManager = "";

  let feedbackMessage = '';
  let feedbackType = '';

  onMount(async () => {
    acronym = $page.params.acronym;
    const userStatus = await checkUserStatus();
    isProjectManager = userStatus.isProjectManager;

    if (!userStatus || !isProjectManager) {
      goto("/deny")
    }

  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const planData = {
      mvpName: planMvpName,
      startDate,
      endDate,
      acronym: acronym
    };
    console.log(planData)

    try {
      const result = await createPlan(planData);
      if (result.errors) {
        console.log(result)
          // Handle specific HTTP status codes
          if (result.status === 403) {
              // Redirect or handle 403 Forbidden error
              goto('/logout'); // Example redirect
          } else {
              // Display all error messages
              feedbackMessage = Array.isArray(result.errors) ? result.errors.join('\n') : result.errors;
              feedbackType = 'error';
          }
      } else {
        // Redirect to the plans page
        feedbackMessage = 'Plan created successfully!';
        feedbackType = 'success';
        goto(`/plan/${acronym}`);
      }
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  function goBack() {
    goto(`/plan/${acronym}`);
  }
</script>


<button class="back-button" on:click={goBack}>← Back</button>
<h1>Create Plan</h1>

<form on:submit={handleSubmit}>
  <div class="form-group">
    <label>Plan MVP Name:</label>
    <input type="text" bind:value={planMvpName} required />
  </div>
  
  <div class="form-group">
    <label>Start Date:</label>
    <input type="date" bind:value={startDate} required />
  </div>
  
  <div class="form-group">
    <label>End Date:</label>
    <input type="date" bind:value={endDate} required />
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

  input {
    padding: 10px;
    font-size: 1em;
    border-radius: 5px;
    border: 1px solid #ccc;
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
    width: 100%; /* Add this line to make the feedback message take the full width */
    box-sizing: border-box; /* Ensures padding is included in the element's total width and height */
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
