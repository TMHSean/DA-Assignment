import { authAPI, userAPI } from './axiosInstances';


// Function to check which groups a user belongs to
export const checkUserGroup = async (username) => {
	try {
		const response = await authAPI.get('/checkgroups', {
			params: { username }, // Send username as a query parameter
			withCredentials: true
		});
		return response; // Assume response data is an array of group names
	} catch (error) {
		console.error('Error checking user groups:', error);
		return [];
	}
};

export async function checkUserStatus() {
	try {
		const response = await authAPI.get('/check', {
			// Axios automatically includes credentials if you configure `withCredentials` in `axiosInstances`
			withCredentials: true
		});

		return response.data; // Axios automatically parses JSON response
	} catch (error) {
		console.error('Error checking user status:', error);
		return null;
	}
}

// Function to get all users
export const getAllUsers = async () => {
	try {
		const response = await userAPI.get('/allusers', { withCredentials: true });
		return response.data;
	} catch (error) {
		console.error('Error fetching users:', error);
		return [];
	}
};

// Function to create a new user
export const createUser = async (userData) => {
	try {
		const userCreateresponse = await userAPI.post('/create', userData, { withCredentials: true });
		const userGroupResponse = await userAPI.post('/adduser', userData, { withCredentials: true });
		return {
			userData: userCreateresponse.data,
			userGroupData: userGroupResponse.data
		}; // Return the response data for further handling
	} catch (error) {
		console.log(error);
		if (error.response) {
			console.log(error);
			// Check if errors are present in response
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error creating User.'
			];
			return { errors: errorMessages }; // Return error messages for frontend handling
		} else {
			return { errors: ['Network error. Please try again later.'] };
		}
	}
};

// Function to update a user
export const updateUser = async (username, userData) => {
	try {
		const updateResponse = await userAPI.put(`/update/${username}`, userData, {
			withCredentials: true
		});
		const statusResponse = await userAPI.put(`/status/${username}`, userData, {
			withCredentials: true
		});
		return {
			updateResult: updateResponse.data,
			statusResult: statusResponse.data
		};
	} catch (error) {
		if (error.response) {
			// Check if errors are present in response
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error updating User.'
			];
			return { errors: errorMessages }; // Return error messages for frontend handling
		} else {
			return { errors: ['Network error. Please try again later.'] };
		}
	}
};

export const updateUserProfile = async (username, userData) => {
	try {
		const updateResponse = await userAPI.put(`/update/${username}`, userData, {
			withCredentials: true
		});
		return updateResponse.data;
	} catch (error) {
		if (error.response) {
			// Check if errors are present in response
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error updating User.'
			];
			return { errors: errorMessages }; // Return error messages for frontend handling
		} else {
			return { errors: ['Network error. Please try again later.'] };
		}
	}
};


// Function to create a new group
export const createGroup = async (groupName) => {
	try {
		const response = await userAPI.post('/creategroup', { groupName }, { withCredentials: true });
		return response.data; // Return the response data for further handling
	} catch (error) {
		if (error.response) {
			// Check if errors are present in response
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error creating group.'
			];
			return { errors: errorMessages }; // Return error messages for frontend handling
		} else {
			return { errors: ['Network error. Please try again later.'] };
		}
	}
};

export const getAllGroups = async () => {
	try {
		const response = await userAPI.get('/allgroups', { withCredentials: true });
		return response.data;
	} catch (error) {
		console.error('Error fetching groups:', error);
		return [];
	}
};

export const insertUserToGroup = async (username, groups) => {
	try {
		const response = await userAPI.post(
			'/adduser',
			{ username, groups },
			{ withCredentials: true }
		);
		return response.data;
	} catch (error) {
		console.error('Error fetching groups:', error);
		return [];
	}
};

export const handleRemovedGroup = async (username, groups) => {
	try {
		const response = await userAPI.delete('/removeuser', {
			params: { username, groups }, // Send username as a query parameter
			withCredentials: true
		});
		return response.data;
	} catch (error) {
		console.error('Error fetching groups:', error);
		return [];
	}
};
