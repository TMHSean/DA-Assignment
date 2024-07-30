<script>
  // You can add script here if needed, e.g., for fetching data or handling logic
  import { onMount } from 'svelte';
  import { checkUserStatus, updateUser } from '$lib/api';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let currentEmail = '';

  onMount(async () => {
    const userStatus = await checkUserStatus();
    if (userStatus) {
      console.log(userStatus)
      currentEmail = userStatus.email; // Assuming the response has an email field
      email = currentEmail;
    } else {
      // Redirect to login if not authenticated
      goto('/deny');
    }
  });
</script>

<style>
  /* Add your styles here */

</style>

<h1>Applications</h1>
<p>0 applications</p>
