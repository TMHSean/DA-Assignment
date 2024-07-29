import { authAPI } from '$lib/axiosInstances';

export async function load({ url }) {
	console.log('URL:', url.pathname); // Log the URL for debugging
	const isLoginPage = url.pathname === '/';
	console.log('Is login page:', isLoginPage); // Log if it's the login page

	if (!isLoginPage) {
		try {
			console.log('Checking authentication...'); // Log for debugging
			const response = await authAPI.get('/check', { withCredentials: true });
			const { isAdmin, username } = response.data;
			console.log('Is authenticated:', isAdmin); // Log authentication status
			console.log('Username:', username); // Log username

			if (username) {
				return {
					props: {
						showNavbar: true,
						isAdmin: isAdmin,
						username: username
					}
				};
			} else {
				return {
					status: 302,
					redirect: '/'
				};
			}
		} catch (error) {
			console.error('Error checking authentication:', error);
			return {
				status: 302,
				redirect: '/'
			};
		}
	} else {
		return {
			props: {
				showNavbar: false,
				isAdmin: false
			}
		};
	}
}
