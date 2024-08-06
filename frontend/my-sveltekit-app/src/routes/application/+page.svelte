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
    padding: 5px 10px;
    cursor: pointer;
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>

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
