<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { checkUserStatus, createGroup, getAllUsers, createUser, updateUser, checkUserGroup, getAllGroups, insertUserToGroup, handleRemovedGroup } from '$lib/api';
  import MultiSelect from 'svelte-multiselect';
	import { updated } from '$app/stores';
	
  let isAdmin = false;
  let groupName = '';
  let users = [];
  // let userGroups = [];
  let allGroups = [];
  let userGroups = {};
  let initialGroups = [];
  let formattedGroups = []; // Array to hold formatted groups for MultiSelect

  // New user fields
  let newUsername = '';
  let newEmail = '';
  let newPassword = '';
  let newGroups = [];
  let newStatus = 0;

  // Editable fields
  let editableUserIndex = -1; // Track which user row is being edited
  let editableGroups = [];
  let editableStatus = 0;
  let editableEmail = '';
  let editablePassword = '';

  onMount(async () => {
    const userStatus = await checkUserStatus();
    if (userStatus) {
      isAdmin = userStatus.isAdmin;
      if (isAdmin) {
        users = await getAllUsers(); // No need for withCredentials here if cookies are properly set
        allGroups = await getAllGroups();
        for (const user of users) {
          userGroups[user.username] = await getUserGroups(user.username);
        }
        formattedGroups = allGroups.map(group => ({
          value: group.group_name,
          label: group.group_name
        }));
      }
    } else {
      goto('/'); // Redirect to login if not authenticated
    }

    if (!isAdmin) {
      goto('/'); // Redirect to homepage if not an admin
    }
  });

  const handleCreateGroup = async () => {
    const result = await createGroup(groupName);

    if (result.errors) {
      // Display all error messages
      result.errors.forEach(error => alert(error));
    } else {
      alert('Group created successfully!'); // Display success message

      // Refresh the group list and update the formatted groups
      allGroups = await getAllGroups();
      formattedGroups = allGroups.map(group => ({
        value: group.group_name,
        label: group.group_name
      }));

      // Clear the input field
      groupName = '';
    }
  };

  const handleCreateUser = async () => {
    const userData = {
      username: newUsername,
      email: newEmail,
      password: newPassword,
      disabled: newStatus,
    };
    
    const result = await createUser(userData);

    if (result.errors) {
      // Display error messages
      alert(result.errors.join('\n'));
    } else {
      alert('User created successfully!'); // Display success message

      // Refresh the user list and update the formatted groups
      users = await getAllUsers();
      allGroups = await getAllGroups();
      for (const user of users) {
        userGroups[user.username] = await getUserGroups(user.username);
      }
    }
  };

  
  const handleEdit = async (index) => {
    editableUserIndex = index;
    editableEmail = users[index].email;
    editablePassword = ''; // Clear password field for security reasons
    editableGroups = await getUserGroups(users[index].username);
    initialGroups = [...editableGroups];
    editableStatus = users[index].disabled;
  };

  const handleSave = async (index) => {
    const updatedUser = {
      email: editableEmail,
      password: editablePassword,
      groups: editableGroups,
      disabled: parseInt(editableStatus)
    };
    // Determine which groups were added or removed
    const removedGroups = initialGroups.filter(group => !editableGroups.includes(group));
    const addedGroups = editableGroups.filter(group => !initialGroups.includes(group));

    // Update the user data in the backend
    const result = await updateUser(users[index].username, updatedUser);
    console.log(result)
    if (result.errors) {
      alert(result.errors.join('\n'));
    } else {
      alert('User updated successfully!');

      // Remove user from removed groups
      if (removedGroups.length > 0) {
        await handleRemovedGroup(users[index].username, removedGroups);
      }

      // Add user to added groups
      if (addedGroups.length > 0) {
        await insertUserToGroup(users[index].username, addedGroups);
      }

      // Refresh the user list
      users = await getAllUsers();
      for (const user of users) {
        userGroups[user.username] = await getUserGroups(user.username);
      }
      editableUserIndex = -1; // Exit edit mode
    }
  };

  const handleCancel = () => {
      editableUserIndex = -1; // Exit edit mode
  };

  const getUserGroups = async (username) => {
    try {
      const response = await checkUserGroup(username);
      return response.data;
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
                <MultiSelect bind:selected={editableGroups} options={formattedGroups}/>
              {:else}
                {#if userGroups[user.username] && Array.isArray(userGroups[user.username])}
                  {#if userGroups[user.username].length > 0}
                    {userGroups[user.username].join(', ')}
                  {:else}
                    Not in any groups
                  {/if}
                {:else}
                  Loading groups...
                {/if}
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
          <td><MultiSelect bind:selected={newGroups} options={formattedGroups}/></td>
          <td>
            <select bind:value={newStatus}>
              <option value=0>Enabled</option>
              <option value=1>Disabled</option>
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
