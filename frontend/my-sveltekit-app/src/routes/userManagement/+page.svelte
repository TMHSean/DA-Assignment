<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { checkUserStatus, createGroup, getAllUsers, createUser, updateUser, checkUserGroup, getAllGroups, insertUserToGroup, handleRemovedGroup } from '$lib/api';
  import MultiSelect from 'svelte-multiselect';
		
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
  let editAdmin = true;
  let superAdmin = false;

  // Editable fields
  let editableUserIndex = -1; // Track which user row is being edited
  let editableGroups = [];
  let editableStatus = 0;
  let editableEmail = '';
  let editablePassword = '';

  onMount(async () => {
    const userStatus = await checkUserStatus();
    console.log(userStatus)
    if (userStatus) {
      //to allow us to know if user logged in is superadmin
      if (userStatus.username == "admin") {
        superAdmin = true;
      } else {
        editAdmin = false;
      }
      // to check if users belong to admin group
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
      goto('/deny'); // Redirect to login if not authenticated
    }

    if (!isAdmin) {
      goto('/deny'); // Redirect to homepage if not an admin
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
      <button class="primary-button" on:click={handleCreateGroup}>+ Create Group</button>

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
                <span class={user.disabled === 0 ? 'status-enabled' : 'status-disabled'}>
                  {user.disabled === 0 ? 'Enabled' : 'Disabled'}
                </span>
              {/if}
            </td>
            <td>
              {#if editableUserIndex === index}
                <div class="button-group">
                  <button class="save-button" on:click={handleCancel}>Cancel</button>
                  <button class="cancel-button" on:click={() => handleSave(index)}>Save</button>
                </div>
              {:else}
                {#if superAdmin || user.username !== 'admin'}
                  <button class="primary-button" on:click={() => handleEdit(index)}>Edit</button>
                {/if}
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
          <td><button class="primary-button" on:click={handleCreateUser}>Create User</button></td>
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

  /* Styles for the User Management Table */
  table {
    width: 100%;
    border-collapse: collapse; /* Ensures no double borders between cells */
    margin-top: 1rem;
  }

  th, td {
    border: 1px solid #ddd; /* Light gray border */
    padding: 8px; /* Padding for spacing */
    text-align: center; /* Align text to the left */
  }

  th {
    background-color: #000; /* Black background for headers */
    color: #fff; /* White text color for headers */
    font-weight: bold; /* Bold text for headers */
  }

  tr:nth-child(even) {
    background-color: #f9f9f9; /* Alternate row color for better readability */
  }

  tr:hover {
    background-color: #f1f1f1; /* Highlight row on hover */
  }

  input[type="text"], input[type="email"], input[type="password"], select {
    width: 100%;
    padding: 8px; /* Padding inside input fields */
    border: 1px solid #ccc; /* Light gray border for input fields */
    border-radius: 4px; /* Rounded corners for input fields */
    box-sizing: border-box; /* Ensure padding is included in width */
  }
  button {
    background-color: #007bff; /* Blue background for buttons */
    color: #fff; /* White text color */
    border: none;
    padding: 8px 12px; /* Padding for buttons */
    border-radius: 4px; /* Rounded corners for buttons */
    cursor: pointer; /* Pointer cursor on hover */
    font-size: 0.9rem; /* Font size for buttons */
    transition: background-color 0.3s, transform 0.3s; /* Smooth transitions */
  }

  .button-group {
    display: flex; /* Arrange buttons in a row */
    gap: 8px; /* Space between buttons */
  }

  .primary-button {
    background-color: #007bff; /* Blue background */
    color: #fff; /* White text */
  }

  .primary-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
    transform: scale(1.05); /* Slightly scale up on hover */
  }

  .cancel-button {
    background-color: #28a745; /* Green background */
    color: #fff; /* White text */
  }

  .cancel-button:hover {
    background-color: #218838; /* Darker green on hover */
    transform: scale(1.05); /* Slightly scale up on hover */
  }

  .save-button {
    background-color: #dc3545; /* Red background */
    color: #fff; /* White text */
  }

  .save-button:hover {
    background-color: #c82333; /* Darker red on hover */
    transform: scale(1.05); /* Slightly scale up on hover */
  }

  .status-enabled {
    color: green;
    font-weight: bold;
  }

  .status-disabled {
    color: red;
    font-weight: bold;
  }


</style>
