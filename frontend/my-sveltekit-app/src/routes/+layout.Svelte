<script>
  export let data;

  $: navStatus = data.props?.showNavbar;
  $: adminStatus = data.props?.isAdmin;
  $: username = data.props?.username; // Retrieve username from props
</script>

{#if navStatus}
  <nav class="navbar">
    <div class="nav-left">
      <a href="/application">Home</a>
      <a href="/profile">Profile</a>
      {#if adminStatus}
        <a href="/userManagement">User Management</a>
      {/if}
    </div>
    <div class="nav-right">
      {#if username}
        <span class="welcome-message">Welcome, {username}</span>
      {/if}
      <a href="/logout">Logout</a>
    </div>
  </nav>
{/if}

<main class={navStatus ? 'with-navbar' : 'no-navbar'}>
  <slot />
</main>

<style>
  /* Navbar Styles */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px; /* Add horizontal padding for more space */
    background-color: #000; /* Black background to match the login page */
    color: white;
    width: 100%; /* Make sure the navbar spans the entire width */
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
    position: fixed; /* Fix the navbar to the top */
    top: 0;
    left: 0;
    z-index: 1000; /* Ensure it stays on top of other content */
    height: 60px; /* Set a fixed height for the navbar */
  }

  .nav-left,
  .nav-right {
    display: flex;
    align-items: center;
    height: 100%; /* Ensure the nav items align with the full height of the navbar */
  }

  .nav-left a,
  .nav-right a {
    color: white;
    text-decoration: none;
    margin: 0 15px; /* Increase margin for more spacing */
    font-size: 18px; /* Increase font size for better visibility */
  }

  .nav-left a:hover,
  .nav-right a:hover {
    text-decoration: underline;
  }

  .welcome-message {
    font-size: 18px; /* Match the font size of the links */
    margin-right: 15px; /* Increase margin for spacing */
  }

  .nav-right {
    display: flex;
    align-items: center;
  }

  /* Main Content Styles */
  .with-navbar {
    padding-top: 60px; 
    margin: 0 auto;
    max-width: 1200px;
  }

  .no-navbar {
    padding-top: 0;
    margin: 0;
    height: 100vh;
  }

</style>
