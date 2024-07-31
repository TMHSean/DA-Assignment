<script>
  import { onMount } from 'svelte';
  import { checkUserStatus, updateUserProfile } from '$lib/api';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let currentEmail = '';
  let loading = true;

  //Feedback Message
  let feedbackMessage = '';
  let feedbackType = '';

  onMount(async () => {
    const userStatus = await checkUserStatus();
    if (userStatus) {
      console.log(userStatus)
      currentEmail = userStatus.email; // Assuming the response has an email field
      email = currentEmail;
      loading = false;
    } else {
      // Redirect to login if not authenticated
      goto('/deny');
    }
  });

  const handleUpdateProfile = async () => {
    try {
      const userStatus = await checkUserStatus();
      const userData = { email, password };
      const checkUpdatesResult = await updateUserProfile(userStatus.username, userData);

      if (checkUpdatesResult.errors) {
      // Display all error messages
        feedbackMessage = checkUpdatesResult.errors.join('\n');
        feedbackType = 'error';
      } else {
        feedbackMessage = 'Profile updated successfully!';
        feedbackType = 'success';
      }
      // Update email to reflect the new value
      currentEmail = email; // Update currentEmail to reflect the new value
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };
</script>

<main>
  {#if loading}
  <!-- Show a loading indicator or nothing while checking status -->
  <p>Loading...</p>
  {:else}
    <h1>Profile</h1>
    <form on:submit|preventDefault={handleUpdateProfile}>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" bind:value={email} />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" bind:value={password} placeholder="New Password" />
      </div>
      <button class="primary-button" type="submit">Update Profile</button>
    </form>

    <!-- Feedback Message Area -->
    {#if feedbackMessage}
      <div class={`feedback-message ${feedbackType}`}>
        Query Result: {feedbackMessage}
      </div>
    {/if}
  {/if}
</main>

<style>
  main {
    max-width: 400px;
    margin: 0 auto;
  }
  form {
    display: flex;
    flex-direction: column;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  label {
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
  }
  button {
    padding: 0.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%; /* Make the button fill the container width */
  }
  button:hover {
    background-color: #0056b3;
  }

  .primary-button {
    background-color: #007bff; /* Blue background */
    color: #fff; /* White text */
  }

  .primary-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
    transform: scale(1.05); /* Slightly scale up on hover */
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
