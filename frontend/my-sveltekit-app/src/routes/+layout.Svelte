<script>

  export let data;

  $: navStatus = data.props?.showNavbar;
  $: adminStatus = data.props?.isAdmin;

</script>

{#if navStatus}
  <nav>
    <a href="/application">Home </a>
    <a href="/profile">Profile</a>
    {#if adminStatus}
      <a href="/userManagement">User Management</a>
    {/if}
    <a href="/logout">Logout</a>
  </nav>
{/if}

<main>
  <slot />
</main>
