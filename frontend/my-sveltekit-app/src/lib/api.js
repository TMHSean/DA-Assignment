import { authAPI, userAPI, groupAPI } from './axiosInstances';

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

// Function to create a new group
export const createGroup = async (groupName) => {
	try {
		await groupAPI.post('/create', groupName, { withCredentials: true });
	} catch (error) {
		console.error('Error creating group:', error);
	}
};

// Function to get all users
export const getAllUsers = async () => {
	try {
		const response = await userAPI.get('/', { withCredentials: true });
		return response.data;
	} catch (error) {
		console.error('Error fetching users:', error);
		return [];
	}
};

// Function to create a new user
export const createUser = async (userData) => {
	try {
		await userAPI.post('/create', userData, { withCredentials: true });
	} catch (error) {
		console.error('Error creating user:', error);
	}
};

// Function to update a user
export const updateUser = async (username, userData) => {
	try {
		await userAPI.put(`/update/${username}`, userData, { withCredentials: true });
		await userAPI.put(`/status/${username}`, userData, { withCredentials: true });
	} catch (error) {
		console.error('Error updating user:', error);
	}
};

// Function to check which groups a user belongs to
export const checkUserGroup = async (username) => {
	try {
		const response = await groupAPI.get('/checkgroups', {
			params: { username }, // Send username as a query parameter
			withCredentials: true
		});
		return response; // Assume response data is an array of group names
	} catch (error) {
		console.error('Error checking user groups:', error);
		return [];
	}
};

export const getAllGroups = async () => {
	try {
		const response = await groupAPI.get('/all', { withCredentials: true });
		return response.data;
	} catch (error) {
		console.error('Error fetching groups:', error);
		return [];
	}
};

export const insertUserToGroup = async (username, groups) => {
	try {
		const response = await groupAPI.post(
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
		const response = await groupAPI.delete('/removeuser', {
			params: { username, groups }, // Send username as a query parameter
			withCredentials: true
		});
		return response.data;
	} catch (error) {
		console.error('Error fetching groups:', error);
		return [];
	}
};
