<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authAPI } from '$lib/axiosInstances';

  let isAdmin = false;
  let showNavbar = true;

  // Determine if the navbar should be shown based on the route
  $: showNavbar = !['/'].includes($page.url.pathname);

  onMount(async () => {
    // Only perform the check if the user is not on the login page
    
    if (showNavbar) {
      console.log("hello")
      const token = document.cookie.split('; ').find(row => row.startsWith('jwt='));
      if (token) {
        try {
          const response = await authAPI.get('/check', {
            withCredentials: true
          });

          if (response.status === 200) {
            console.log("Hello")
            const data = response.data;
            isAdmin = data.isAdmin;
          } else {
            goto('/'); // Redirect to login if the check fails
          }
        } catch (error) {
          console.error('Error checking session:', error);
          goto('/'); // Redirect to login on error
        }
      } else {
        goto('/'); // Redirect to login if no token is found
      }
    }
  });

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await authAPI.post('/logout', {}, {
        withCredentials: true
      });

      if (response.status === 200) {
        goto('/?message=Logout%20successful'); // Redirect with a message
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
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

  nav button.logout {
    background: none;
    border: none;
    color: white;
    text-decoration: none;
    padding: 10px;
    cursor: pointer;
  }
</style>

<main>
  {#if showNavbar}
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/profile">Profile</a>
        {#if isAdmin}
          <a href="/usermanagement">User Management</a>
        {/if}
        <button class="logout" on:click={handleLogout}>Logout</button>
      </nav>
    </header>
  {/if}

  <slot></slot> <!-- This slot is where the content of each page will be rendered -->
</main>
