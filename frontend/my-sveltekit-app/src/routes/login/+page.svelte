<script>
  import { goto } from '$app/navigation';
  import { authAPI } from '$lib/axiosInstances';

  let username = '';
  let password = '';
  let error = '';

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

      console.log(response)

      // Check if the request was successful
      if (response.status === 200) {
        goto('/'); // Redirect to the homepage upon successful login
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
  /* Add your styles here */
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
</main>
