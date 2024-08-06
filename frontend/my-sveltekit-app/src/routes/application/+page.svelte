<script>
  import { onMount } from 'svelte';
  import { checkUserStatus, getAllApplications } from '$lib/api';
  import { goto } from '$app/navigation';

  let applications = [];
  let isProjectLead = false;

  onMount(async () => {
    const userStatus = await checkUserStatus();
    isProjectLead = userStatus.isProjectLead;
    if (userStatus) {
      applications = await getAllApplications(); // Fetch applications from the backend
    } else {
      // Redirect to login if not authenticated
      goto('/');
    }
  });

  function createApplication() {
    goto('/createapplication');
  }

  function editApplication(acronym) {
    console.log('Edit application with acronym:', acronym);
    goto(`/applicationdetails/${acronym}`);
  }
</script>

<h1>Applications</h1>

{#if isProjectLead}
  <button class="create-app-button" on:click={createApplication}>+ Create App</button>
{/if}

<div class="applications-container">
  {#each applications as application}
    <a href={`/taskpage/${application.app_acronym}`} class="application-card">
      <h2>{application.app_acronym}</h2>
      {#if isProjectLead}
        <button type="button" on:click|preventDefault={() => editApplication(application.app_acronym)}>+ Edit</button>
      {/if}
    </a>
  {/each}
</div>


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
    border-radius: 5px;
    transition: background-color 0.2s;
  }

  .create-app-button:hover {
    background-color: #0056b3; /* Darker blue for hover effect */
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
    text-decoration: none;
    color: black;
    transition: transform 0.2s;
  }

  .application-card:hover {
    transform: scale(1.05);
  }

  .application-card h2 {
    text-align: center;
    margin-bottom: auto;
  }

  .application-card button {
    background-color: #007bff; /* Primary blue color */
    color: white;
    border: none;
    padding: 10px 30px; /* Increased padding to make the button longer */
    cursor: pointer;
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 25px; /* Rounded corners */
    transition: background-color 0.2s, transform 0.2s;
    font-size: 14px; /* Adjusted font size */
  }

  .application-card button:hover {
    background-color: #0056b3; /* Darker blue for hover effect */
    transform: translateX(-50%) scale(1.05); /* Slightly enlarge on hover */
  }
</style>