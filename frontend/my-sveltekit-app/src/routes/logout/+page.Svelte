<script>
  import { goto } from '$app/navigation';
  import { authAPI } from '$lib/axiosInstances';
  

  const handleLogout = async () => {
    try {
      // Send a POST request to the logout endpoint
      await authAPI.post('/logout', {}, {
        // Ensure cookies are sent with the request
        withCredentials: true
      });

      // Redirect to the login page after successful logout
      goto('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Automatically handle logout on page load
  handleLogout();
</script>

<main>
  <p>Logging out...</p>
</main>
