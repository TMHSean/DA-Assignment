<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { checkUserStatus } from '$lib/api';
  let isAdmin = false;

  onMount(async () => {
    const userStatus = await checkUserStatus();
    if (userStatus) {
      isAdmin = userStatus.isAdmin;
    } else {
      goto('/login'); // Redirect to login if not authenticated
    }

    if (!isAdmin) {
      goto('/'); // Redirect to homepage if not an admin
    }
  });
</script>

<style>
  /* Add your styles here */
</style>

<main>
  {#if isAdmin}
    <h1>User Management</h1>
    <!-- Add user management functionality here -->
  {/if}
</main>
