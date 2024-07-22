<script>

  import { userAPI } from "$lib/axiosInstances";

  let username = '';
  let password = '';
  let message = '';

  async function loginUser() {
    try {
      const response = await userAPI.post('/login', {
        username,
        password
      });

      if (response.status === 200) {
        message = 'Login successful!';
        // Handle successful login (e.g., redirect to another page, store token)
      } else {
        message = 'Invalid username or password.';
      }
    } catch (error) {
      message = error.response?.data || 'An error occurred.';
    }
  }
</script>

<h1>Login</h1>
<form on:submit|preventDefault={loginUser}>
  <label>
    Username:
    <input type="text" bind:value={username} required />
  </label>
  <label>
    Password:
    <input type="password" bind:value={password} required />
  </label>
  <button type="submit">Login</button>
</form>

<p>{message}</p>
