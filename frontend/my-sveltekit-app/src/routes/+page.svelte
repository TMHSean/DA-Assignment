<script>
  import { goto } from '$app/navigation';
  import { authAPI } from '$lib/axiosInstances';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let username = '';
  let password = '';
  let error = '';
  let message = '';

  //Feedback Message
  let feedbackMessage = '';
  let feedbackType = '';

  $: params = new URLSearchParams($page.url.search);

  onMount(() => {
    message = params.get('message') || '';

    if (message) {
      feedbackMessage = message;
      feedbackType = 'success'; // Assuming message indicates a success
    }
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

      console.log(response.status)

      // Check if the request was successful
      if (response.status === 200) {
        goto('/application'); // Redirect to the homepage upon successful login
      }
    } catch (error) {
      if (error.response) {
        // Display all error messages
        if (error.response.status === 401) {
          feedbackMessage = "Invalid username or password.";
          feedbackType = 'error';
        } else if (error.response.status === 403) {
          feedbackMessage = "User account has been disabled.";
          feedbackType = 'error';
        } else {
          feedbackMessage = "Error during login. Please try again";
          feedbackType = 'error';
        }
      } else {
        // Handle other errors, if necessary
        feedbackMessage = "Error during login. Please try again";
        feedbackType = 'error';
      }
    }
  };
</script>

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
  <!-- Feedback Message Area -->
  {#if feedbackMessage}
  <div class={`feedback-message ${feedbackType}`}>
    {feedbackMessage}
  </div>
{/if}
</main>

<style>
  .message {
    color: green;
    font-weight: bold;
  }
  .error {
    color: red;
  }

    /* Styles for the login page */
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #f0f0f0; /* Light gray background to contrast with black */
    font-family: Arial, sans-serif;
    color: #000; /* Black text color */
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #000; /* Black color for heading */
  }

  form {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  label {
    display: block;
    margin-bottom: 1rem;
    font-weight: bold;
    color: #000; /* Black color for labels */
  }

  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 0.75rem;
    margin-top: 0.25rem;
    border: 1px solid #ccc; /* Light gray border */
    border-radius: 4px;
    box-sizing: border-box;
  }

  input[type="text"]:focus,
  input[type="password"]:focus {
    border-color: #000; /* Black border on focus */
    outline: none;
  }

  button[type="submit"] {
    background: #000; /* Black background */
    color: #fff; /* White text color */
    border: none;
    padding: 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    width: 100%; /* Button fills the available width */
    box-sizing: border-box;
  }

  button[type="submit"]:hover {
    background: #333; /* Darker black for hover effect */
  }

  .feedback-message {
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
  }

  .feedback-message.success {
      background-color: #d4edda;
      color: #155724;
    }

  .feedback-message.error {
    background-color: #f8d7da;
    color: #721c24;
  }

</style>