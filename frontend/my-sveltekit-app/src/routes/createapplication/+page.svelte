<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getAllGroups } from '$lib/api';

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

  onMount(async () => {
    try {
      const result = await getAllGroups();
      console.log(result)
      groups = result; // Assign the fetched groups to the variable
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  });

  const handleSubmit = (event) => {
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
    console.log(formData);
    // You can add your form submission logic here
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
</style>
