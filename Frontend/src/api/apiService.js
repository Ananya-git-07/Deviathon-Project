import axios from 'axios';

// Get the base URL from the environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_URL) {
  console.error(
    'VITE_API_BASE_URL is not set. Please create a .env file in the frontend root and add it.'
  );
}

// Configure the base URL for all API requests
const apiClient = axios.create({
  baseURL: `${API_URL}/api`, // Append /api to the base URL
});

// Function to fetch trends based on a topic
export const fetchTrends = (topic) => {
  return apiClient.get(`/trends?topic=${topic}`);
};

// Function to generate a content strategy
export const generateStrategy = (data) => {
  return apiClient.post('/strategy/generate', data);
};

// Function to get all tracked competitors
export const getCompetitors = () => {
  return apiClient.get('/competitors');
};

// Function to add a new competitor to track
export const addCompetitor = (data) => {
  return apiClient.post('/competitors', data);
};