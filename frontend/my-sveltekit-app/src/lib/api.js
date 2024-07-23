import { authAPI } from './axiosInstances';

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
