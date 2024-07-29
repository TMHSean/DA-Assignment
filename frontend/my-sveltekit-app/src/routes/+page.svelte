<script>
  import { goto } from '$app/navigation';
  import { authAPI } from '$lib/axiosInstances';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let username = '';
  let password = '';
  let error = '';
  let message = '';

  $: params = new URLSearchParams($page.url.search);

  onMount(() => {
    message = params.get('message') || '';
  });

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // Make the login request with Axios
      const response = await authAPI.post('/login', {
        username,
        password
      }, {
        withCredentials: true // Include this option to allow cookies to be sent and received
      });

      // Check if the request was successful
      if (response.status === 200) {
        goto('/application'); // Redirect to the homepage upon successful login
      } else {
        error = 'Login failed'; // Set a generic error message
      }
    } catch (error) {
      console.error('Error during login:', error);
      error = 'An error occurred. Please try again.'; // Set a user-friendly error message
    }
  };
</script>

<style>
  .message {
    color: green;
    font-weight: bold;
  }
  .error {
    color: red;
  }
</style>

<main>
  <h1>Login</h1>
  <form on:submit|preventDefault={handleLogin}>
    <label>
      Username
      <input type="text" bind:value={username} required />
    </label>
    <label>
      Password
      <input type="password" bind:value={password} required />
    </label>
    {#if error}
      <p>{error}</p>
    {/if}
    <button type="submit">Login</button>
  </form>
  {#if message}
    <p class="message">{message}</p>
  {/if}
</main>
