<script>
  import axios from 'axios';

  let username = '';
  let password = '';
  let email = '';
  let disabled = 0;
  let message = '';

  async function registerUser() {
    try {
      const response = await axios.post('http://localhost:3000/users/create', {
        username,
        password,
        email,
        disabled
      });

      if (response.status === 201) {
        message = 'User registered successfully!';
        username = '';
        password = '';
        email = '';
      } else {
        message = 'Failed to register user.';
      }
    } catch (error) {
      message = error.response?.data || 'An error occurred.';
    }
  }
</script>

<h1>Register</h1>
<form on:submit|preventDefault={registerUser}>
  <label>
    Username:
    <input type="text" bind:value={username} required />
  </label>
  <label>
    Password:
    <input type="password" bind:value={password} required />
  </label>
  <label>
    Email:
    <input type="email" bind:value={email} required />
  </label>
  <button type="submit">Register</button>
</form>

<p>{message}</p>
