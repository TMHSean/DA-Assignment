<script>
  import { goto } from '$app/navigation';
  import { authAPI } from '$lib/axiosInstances';
  

  const handleLogout = async () => {
    try {
      // Send a POST request to the logout endpoint
      const response = await authAPI.post('/logout', {}, {
        withCredentials: true
      });

      // Check if the response status is 200 for successful logout
      if (response.status === 200) {
        goto('/?message=Logout%20successful'); // Redirect with a success message
      } else {
        console.error('Logout failed:', response.data);
      }
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
