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

<main>
  <slot />
</main>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #333;
    color: white;
  }

  .nav-left a,
  .nav-right a {
    color: white;
    text-decoration: none;
    margin: 0 10px;
    font-size: 16px;
  }

  .nav-left a:hover,
  .nav-right a:hover {
    text-decoration: underline;
  }

  .welcome-message {
    font-size: 16px;
    margin-right: 10px;
  }

  .nav-right {
    display: flex;
    align-items: center;
  }
</style>
