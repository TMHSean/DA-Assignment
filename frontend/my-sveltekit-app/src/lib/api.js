import { authAPI, userAPI, taskAPI } from './axiosInstances';

// Function to check which groups a user belongs to
export const retrieveUserGroups = async (username) => {
	try {
		const response = await userAPI.get('/retrieveusergroups', {
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
		const userCreateResponse = await userAPI.post('/create', userData, { withCredentials: true });
		const userGroupResponse = await userAPI.post('/adduser', userData, { withCredentials: true });
		return {
			userData: userCreateResponse.data,
			userGroupData: userGroupResponse.data
		}; // Return the response data for further handling
	} catch (error) {
		console.error(error);
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error creating User.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
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
		let errorMessages = ['Error updating user.'];
		let statusCode = error.response ? error.response.status : null;

		if (error.response) {
			console.log(error.response);
			errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error updating user.'
			];
		} else {
			errorMessages = ['Network error. Please try again later.'];
		}

		return {
			errors: errorMessages,
			status: statusCode
		};
	}
};

export const updateUserProfile = async (username, userData) => {
	try {
		const updateResponse = await userAPI.put(`/updateprofile/${username}`, userData, {
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
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code for further handling
			};
		} else {
			return {
				errors: ['Network error. Please try again later.'],
				status: 500 // Default status code for network errors
			};
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
		console.error('Error adding groups:', error);
		let errorMessages = ['Error adding groups.'];
		let statusCode = error.response ? error.response.status : null;

		if (error.response) {
			errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error adding groups.'
			];
		} else {
			errorMessages = ['Network error. Please try again later.'];
		}

		return {
			errors: errorMessages,
			status: statusCode
		};
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
		console.error('Error removing groups:', error);
		let errorMessages = ['Error removing groups.'];
		let statusCode = error.response ? error.response.status : null;

		if (error.response) {
			errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error removing groups.'
			];
		} else {
			errorMessages = ['Network error. Please try again later.'];
		}

		return {
			errors: errorMessages,
			status: statusCode
		};
	}
};

export const checkUserGroup = async (groupName) => {
	try {
		const response = await authAPI.get('/checkusergroup', {
			params: { groupName }, // Send username as a query parameter
			withCredentials: true
		});
		return response;
	} catch (error) {
		console.error('Error checking groups:', error);
		let errorMessages = ['Error checking user groups.'];
		let statusCode = error.response ? error.response.status : null;

		if (error.response) {
			errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error checking user groups.'
			];
		} else {
			errorMessages = ['Network error. Please try again later.'];
		}

		return {
			errors: errorMessages,
			status: statusCode
		};
	}
};


export const getAllApplications = async () => {
	try {
		const response = await taskAPI.get('/all', { withCredentials: true });
		return response.data;
	} catch (error) {
		console.error('Error fetching groups:', error);
		return [];
	}
};

// Function to get application details by acronym
export const getApplicationDetails = async (acronym) => {
	try {
		const response = await taskAPI.get(`/get/${acronym}`, { withCredentials: true });
		return response.data;
	} catch (error) {
		console.error('Error fetching application details:', error);
		throw error;
	}
};

export const createApplication = async (applicationData) => {
	try {
		const response = await taskAPI.post('/create', applicationData, { withCredentials: true });
		return response.data;
	} catch (error) {
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error creating application.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};

// Function to update an application
export const updateApplication = async (acronym, applicationData) => {
	try {
		const updateResponse = await taskAPI.put(`/update/${acronym}`, applicationData, {
			withCredentials: true
		});
		return updateResponse.data;
	} catch (error) {
		if (error.response) {
			console.log("HELLO" + error)
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error creating application.'
			];
			console.log(errorMessages)
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};

// Function to create a new plan
export const createPlan = async (planData) => {
	try {
		const response = await taskAPI.post('/plans/create', planData, { withCredentials: true });
		return response.data;
	} catch (error) {
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error creating plan.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};

// Function to get all plans
export const getAllPlans = async (acronym) => {
	try {
		const response = await taskAPI.get(`/plans/all/${acronym}`, { withCredentials: true });
		return response.data;
	} catch (error) {
		console.error('Error fetching plans:', error);
		return [];
	}
};
// Function to get plan details by acronym and MVP name
export const getPlanDetails = async (planAppAcronym, planMvpName) => {
	try {
		const response = await taskAPI.get(`/plans/get/${planAppAcronym}/${planMvpName}`, { withCredentials: true });
		return response.data;
	} catch (error) {
		console.error('Error fetching plan details:', error);
		throw error;
	}
};

// Function to update a plan
export const updatePlan = async (planAppAcronym, planMvpName, planData) => {
	try {
		const updateResponse = await taskAPI.put(`/plans/update/${planAppAcronym}/${planMvpName}`, planData, {
			withCredentials: true
		});
		return updateResponse.data;
	} catch (error) {
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error updating plan.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};

export const createTask = async (taskData) => {
	try {
		const response = await taskAPI.post('/createtask', taskData, { withCredentials: true });
		return response.data;
	} catch (error) {
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error creating task.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};

export const getTasksForApplication = async (acronym) => {
	try {
		const response = await taskAPI.get(`/getByAcronym/${acronym}`, { withCredentials: true });
		return response.data;
	} catch (error) {
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error fetching task.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};

// API function to get task details
export const getTaskDetails = async (taskId) => {
	try {
		const response = await taskAPI.get(`/getTask/${taskId}`, { withCredentials: true });
		return response.data;
	} catch (error) {
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error fetching task details.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};

// API function to get task details
export const getTaskNotesDetails = async (taskId) => {
	try {
		const response = await taskAPI.get(`/getTasknotes/${taskId}`, { withCredentials: true });
		return response.data;
	} catch (error) {
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error fetching task details.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};


// API function to update task
export const updateTask = async (taskId, note) => {
	try {
		const response = await taskAPI.post(`/update/${taskId}/update`, { note }, { withCredentials: true });
		return response.data;
	} catch (error) {
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error updating task.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};


// API function to take on a task
export const takeOnTask = async (taskId) => {
	try {
		const response = await taskAPI.post(`/tasks/${taskId}/take`, {}, { withCredentials: true });
		return response.data;
	} catch (error) {
		if (error.response) {
			const errorMessages = error.response.data.errors || [
				error.response.data.message || 'Error taking on task.'
			];
			return {
				errors: errorMessages,
				status: error.response.status // Return the status code
			};
		} else {
			return {
				errors: ['Network error. Please try again later.']
			};
		}
	}
};

