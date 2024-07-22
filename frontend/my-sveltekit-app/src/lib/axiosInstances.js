import axios from 'axios';

const userAPI = axios.create({
	baseURL: 'http://localhost:3000/users', // Replace with your first backend URL
	headers: {
		'Content-Type': 'application/json'
	}
});

// const api2 = axios.create({
// 	baseURL: 'http://another-api-url.com', // Replace with your second backend URL
// 	headers: {
// 		'Content-Type': 'application/json'
// 	}
// });

export { userAPI };
