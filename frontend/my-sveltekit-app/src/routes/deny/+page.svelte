<script>
  // Add any script logic if needed
</script>

<style>
  /* Reset default styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4; /* Light gray background */
    color: #333; /* Dark gray text for better readability */
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    margin: 0;
  }

  .container {
    background-color: #fff; /* White background for the content area */
    padding: 2rem 3rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 100%;
  }

  .error-code {
    font-size: 8rem;
    font-weight: bold;
    color: #000; /* Black text color */
    margin-bottom: 0.5rem;
  }

  .error-message {
    font-size: 2rem;
    font-weight: bold;
    color: #333; /* Dark gray text color */
    margin-bottom: 1rem;
  }

  .description {
    font-size: 1.2rem;
    color: #666; /* Medium gray text color for description */
    margin-bottom: 2rem;
  }

  .back-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
    color: #007bff; /* Modern blue color for the link */
    text-decoration: none;
    border: 2px solid #007bff;
    border-radius: 5px;
    background-color: #fff;
    transition: background-color 0.3s, color 0.3s;
  }

  .back-link:hover {
    background-color: #007bff; /* Blue background on hover */
    color: #fff; /* White text color on hover */
  }
</style>

<div class="container">
  <h1 class="error-code">403</h1>
  <p class="error-message">Forbidden</p>
  <p class="description">You do not have permission to access this page.</p>
  <a href="/" class="back-link">Go to Homepage</a>
</div>
