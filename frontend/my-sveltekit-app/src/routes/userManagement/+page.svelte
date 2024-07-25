<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { checkUserStatus, createGroup, getAllUsers, createUser, updateUser, checkUserGroup, getAllGroups } from '$lib/api';
  import MultiSelect from 'svelte-multiselect';
  let isAdmin = false;
  let groupName = '';
  let users = [];
  let userGroups = [];
  let allGroups = [];

  // New user fields
  let newUsername = '';
  let newEmail = '';
  let newPassword = '';
  let newGroup = '';
  let newStatus = '';

  // Editable fields
  let editableUserIndex = -1; // Track which user row is being edited
  let editableGroups = [];
  let editableStatus = '';
  let editableEmail = '';
  let editablePassword = '';

  onMount(async () => {
    const userStatus = await checkUserStatus();
    if (userStatus) {
      isAdmin = userStatus.isAdmin;
      if (isAdmin) {
        users = await getAllUsers(); // No need for withCredentials here if cookies are properly set
      }
    } else {
      goto('/login'); // Redirect to login if not authenticated
    }

    if (!isAdmin) {
      goto('/'); // Redirect to homepage if not an admin
    }
  });

  const handleCreateGroup = async () => {
    await createGroup({ groupName }); // No need for withCredentials here if cookies are properly set
    // Optionally, refresh the user list or show a success message
  };

  const handleCreateUser = async () => {
    const userData = {
      username: newUsername,
      email: newEmail,
      password: newPassword,
      group: newGroup,
      status: newStatus,
    };
    await createUser(userData); // No need for withCredentials here if cookies are properly set
    // Refresh the user list or show a success message
    users = await getAllUsers();
    allGroups = await getAllGroups();
  };

  const handleEdit = async (index) => {
    editableUserIndex = index;
    editableEmail = users[index].email;
    editablePassword = ''; // Clear password field for security reasons
    editableGroups = users[index].groups; // Assuming groups are part of the user data
    editableStatus = users[index].status;
  };

  const handleSave = async (index) => {
    const updatedUser = {
      email: editableEmail,
      password: editablePassword,
      groups: editableGroups,
      status: editableStatus
    };

    // Update the user data in the backend
    await updateUser(users[index].username, updatedUser);

    // Refresh the user list
    users = await getAllUsers();
    editableUserIndex = -1; // Exit edit mode
  };

  const handleCancel = () => {
      editableUserIndex = -1; // Exit edit mode
  };

  const getUserGroups = async (username) => {
    try {
      const response = await checkUserGroup(username);
      console.log(response)
      return response;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  };

</script>

<main>
  {#if isAdmin}
    <h1>User Management</h1>
    <div class="create-group">
      <input type="text" bind:value={groupName} placeholder="Enter Group Name" />
      <button on:click={handleCreateGroup}>+ Create Group</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Password</th>
          <th>Group</th>
          <th>Status</th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user, index}
          <tr>
            <td>{user.username}</td>
            <td>
              {#if editableUserIndex === index}
                <input type="email" bind:value={editableEmail} />
              {:else}
                {user.email}
              {/if}
            </td>
            <td>
              {#if editableUserIndex === index}
                <input type="password" bind:value={editablePassword} placeholder="New Password" />
              {:else}
                ****** 
              {/if}
            </td>
            <td>
              {#if editableUserIndex === index}
                <MultiSelect bind:selected={editableGroups} options={allGroups} />
              {:else}
                {#await getUserGroups(user.username) then groups}
                  <!-- {groups.join(', ')} -->
                   <!-- {console.log(groups)} -->
                <!-- {:catch error} -->
                  <span>Error fetching groups</span>
                {/await}
              {/if}
            </td>
            <td>
              {#if editableUserIndex === index}
                <select bind:value={editableStatus}>
                  <option value=0>Enabled</option>
                  <option value=1>Disabled</option>
                </select>
              {:else}
                {user.disabled === 0 ? 'Enabled' : 'Disabled'}
              {/if}
            </td>
            <td>
              {#if editableUserIndex === index}
                <button on:click={() => handleSave(index)}>Save</button>
                <button on:click={handleCancel}>Cancel</button>
              {:else}
                <button on:click={() => handleEdit(index)}>Edit</button>
              {/if}
            </td>
          </tr>
        {/each}
        <tr>
          <td><input type="text" bind:value={newUsername} placeholder="Username" /></td>
          <td><input type="text" bind:value={newEmail} placeholder="Email" /></td>
          <td><input type="password" bind:value={newPassword} placeholder="Password" /></td>
          <td><input type="text" bind:value={newGroup} placeholder="Group" /></td>
          <td>
            <select bind:value={newStatus}>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </td>
          <td><button on:click={handleCreateUser}>Create User</button></td>
        </tr>
      </tbody>
    </table>
  {/if}
</main>

<style>
  .create-group {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .create-group input {
    margin-right: 0.5rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  th {
    background-color: #f2f2f2;
  }

  .edit-button, .save-button {
    cursor: pointer;
  }
</style>
