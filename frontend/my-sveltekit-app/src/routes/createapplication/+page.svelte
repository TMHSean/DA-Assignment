<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { createApplication, getAllGroups } from '$lib/api';

  let acronym = "";
  let description = "";
  let rnumber = 0;
  let startDate = "";
  let endDate = "";
  let permitCreate = "";
  let permitOpen = "";
  let permitToDo = "";
  let permitDoing = "";
  let permitDone = "";

  let groups = [];
  let feedbackMessage = '';
  let feedbackType = '';

  onMount(async () => {
    try {
      const result = await getAllGroups();
      groups = result; // Assign the fetched groups to the variable
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      acronym,
      description,
      rnumber,
      startDate,
      endDate,
      permitCreate,
      permitOpen,
      permitToDo,
      permitDoing,
      permitDone
    };

    try {
      const result = await createApplication(formData);

      if (result.errors) {
          // Handle specific HTTP status codes
          if (result.status === 403) {
              // Redirect or handle 403 Forbidden error
              goto('/logout'); // Example redirect
          } else {
              // Display all error messages
              feedbackMessage = result.errors.join('\n');
              feedbackType = 'error';
          }
      } else {
        feedbackMessage = 'Application created successfully!';
        feedbackType = 'success';
        // Optionally, redirect or clear form fields
        // goto('/applications'); // Example redirect

        // Clear form fields on successful submission
        acronym = "";
        description = "";
        rnumber = 0;
        startDate = "";
        endDate = "";
        permitCreate = "";
        permitOpen = "";
        permitToDo = "";
        permitDoing = "";
        permitDone = "";
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      feedbackMessage = 'An unexpected error occurred. Please try again later.';
      feedbackType = 'error';
    }
  };
</script>

<form on:submit={handleSubmit}>
  <h2>Create Application</h2>
  
  <div class="column">
    <div class="form-group">
      <label>Acronym:</label>
      <input type="text" bind:value={acronym} />
    </div>
    
    <div class="form-group">
      <label>Description:</label>
      <textarea class="description-textarea" bind:value={description}></textarea>
    </div>
    
    <div class="form-group">
      <label>Rnumber:</label>
      <input type="number" bind:value={rnumber} />
    </div>
    
    <div class="form-group">
      <label>Start Date:</label>
      <input type="date" bind:value={startDate} />
    </div>
    
    <div class="form-group">
      <label>End Date:</label>
      <input type="date" bind:value={endDate} />
    </div>
  </div>
  
  <div class="column">
    <div class="form-group">
      <label>Permit_Create:</label>
      <select bind:value={permitCreate}>
        <option value="">Select Group</option>
        {#each groups as group}
          <option value={group.group_name}>{group.group_name}</option>
        {/each}
      </select>
    </div>
    
    <div class="form-group">
      <label>Permit_Open:</label>
      <select bind:value={permitOpen}>
        <option value="">Select Group</option>
        {#each groups as group}
          <option value={group.group_name}>{group.group_name}</option>
        {/each}
      </select>
    </div>
    
    <div class="form-group">
      <label>Permit_ToDo:</label>
      <select bind:value={permitToDo}>
        <option value="">Select Group</option>
        {#each groups as group}
          <option value={group.group_name}>{group.group_name}</option>
        {/each}
      </select>
    </div>
    
    <div class="form-group">
      <label>Permit_Doing:</label>
      <select bind:value={permitDoing}>
        <option value="">Select Group</option>
        {#each groups as group}
          <option value={group.group_name}>{group.group_name}</option>
        {/each}
      </select>
    </div>
    
    <div class="form-group">
      <label>Permit_Done:</label>
      <select bind:value={permitDone}>
        <option value="">Select Group</option>
        {#each groups as group}
          <option value={group.group_name}>{group.group_name}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="submit-button-container">
    <button type="submit">Submit</button>
  </div>

  {#if feedbackMessage}
    <p class="feedback-message {feedbackType}">{feedbackMessage}</p>
  {/if}
</form>

<style>
  h2 {
    text-align: center;
    width: 100%;
  }

  form {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px; /* Optional: to give some padding around the form */
  }

  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  label {
    margin-bottom: 5px;
    font-weight: bold;
  }

  input, textarea, select, button {
    padding: 10px;
    font-size: 1em;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  textarea {
    resize: vertical;
  }

  button {
    background-color: #007bff; /* Primary blue color */
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    font-size: 1em;
    border-radius: 5px;
    width: 100%;
  }

  .submit-button-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .description-textarea {
    height: 100px; /* Adjust height as needed */
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
