<script>
  /** @type {import('./$types').LayoutData} */
  export let data;

  $: navStatus = data.props?.showNavbar;
  $: adminStatus = data.props?.isAdmin;

// Extract data from the `data` prop
// let navStatus = data.props.showNavbar;
// let adminStatus = data.props.isAdmin;;

</script>

{#if navStatus}
  <nav>
    <a href="/">Home </a>
    <a href="/profile">Profile</a>
    {#if adminStatus}
      <a href="/user-management">User Management</a>
    {/if}
    <a href="/logout">Logout</a>
  </nav>
{/if}

<main>
  <slot />
</main>
