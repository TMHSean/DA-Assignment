<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authAPI } from '$lib/axiosInstances';

  let isAdmin = false;

  onMount(async () => {
    try {
      // Perform the API request to check user status
      const response = await authAPI.get('/check', {
        // Ensure cookies are included in the request
        withCredentials: true
      });

      if (response.status === 200) {
        const data = response.data;
        isAdmin = data.isAdmin; // Adjust based on your API response
      } else {
        goto('/login'); // Redirect to login if the check fails
      }
    } catch (error) {
      console.error('Error checking session:', error);
      goto('/login'); // Redirect to login on error
    }
  });
</script>

<style>
  /* Add your styles here */
  nav {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background-color: #333;
  }

  nav a {
    color: white;
    text-decoration: none;
    padding: 10px;
  }

  nav a.logout {
    margin-left: auto;
  }
</style>

<main>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/profile">Profile</a>
      {#if isAdmin}
        <a href="/usermanagement">User Management</a>
      {/if}
      <a href="/logout" class="logout">Logout</a>
    </nav>
  </header>

  <slot></slot> <!-- This slot is where the content of each page will be rendered -->
</main>
