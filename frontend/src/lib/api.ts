import axios from 'axios';

// 1. Create the Axios instance with your base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add a Request Interceptor (The "Toll Booth")
api.interceptors.request.use(
  (config) => {
    // Grab the token from local storage
    const token = localStorage.getItem('token');
    
    // If the token exists, attach it to the Authorization header automatically!
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. (Optional but recommended) Add a Response Interceptor
// This globally catches 401 (Unauthorized) errors. If a user's token expires,
// it instantly clears their storage and kicks them back to the login screen!
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;