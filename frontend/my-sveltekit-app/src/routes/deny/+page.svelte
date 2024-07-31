<script>
  // You can add any script logic here if needed
</script>

<main class="forbidden-page">
  <div class="container">
    <h1>403</h1>
    <p>Forbidden</p>
    <p>You don't have permission to access this page.</p>
    <a href="/logout" class="home-button">Go to Login</a>
  </div>
</main>

<style>
  .forbidden-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8f9fa;
    font-family: Arial, sans-serif;
    color: #333;
  }

  .container {
    text-align: center;
    background: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    font-size: 6rem;
    margin: 0;
    color: #000; /* Red color for emphasis */
  }

  p {
    font-size: 1.2rem;
    margin: 0.5rem 0;
  }

  .home-button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    color: #fff;
    background-color: #007bff; /* Blue background */
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s, transform 0.3s;
  }

  .home-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
    transform: translateY(-2px); /* Slight lift effect */
  }

  .home-button:active {
    background-color: #003d7a; /* Even darker blue when clicked */
    transform: translateY(0); /* Reset lift effect */
  }
</style>
