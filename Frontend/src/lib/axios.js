import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE=="development" ? "http://localhost:5000/api":"/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  maxContentLength: 50 * 1024 * 1024 // 50MB max-size
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 413) {
      throw new Error('File size too large. Please select a smaller file.');
    }
    throw error;
  }
);