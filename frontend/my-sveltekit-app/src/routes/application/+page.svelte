<script>
  import { onMount } from 'svelte';
  import { checkUserStatus, getApplications } from '$lib/api';
  import { goto } from '$app/navigation';

  let applications = [];

  onMount(async () => {
    const userStatus = await checkUserStatus();
    if (userStatus) {
      applications = await getApplications(); // Fetch applications from the backend
    } else {
      // Redirect to login if not authenticated
      goto('/login');
    }
  });

  function createApplication() {
    goto('/createapplication');
  }

  function editApplication(id) {
    // Implement the edit functionality
    console.log('Edit application with ID:', id);
  }
</script>

<style>
  h1 {
    text-align: center;
  }

  .create-app-button {
    background-color: #007bff; /* Primary blue color */
    color: white;
    border: none;
    padding: 10px;
    font-size: 16px;
    width: 100%;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .applications-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    padding: 20px;
  }

  .application-card {
    background-color: white;
    border: 1px solid black;
    border-radius: 15px;
    padding: 20px;
    margin: 10px;
    width: 200px;
    height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .application-card h2 {
    text-align: center;
    margin-bottom: auto;
  }

  .application-card button {
    background-color: #007bff; /* Primary blue color */
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>

<h1>Applications</h1>

<button class="create-app-button" on:click={createApplication}>+ Create App</button>

<div class="applications-container">
  {#each applications as application}
    <div class="application-card">
      <h2>{application.name}</h2>
      <button on:click={() => editApplication(application.id)}>+ Edit</button>
    </div>
  {/each}
</div>
