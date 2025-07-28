// API service for Combo Generator
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
    throw new ApiError(errorData.error || `HTTP error! status: ${response.status}`, response.status);
  }
  return response.json();
};

export const menuApi = {
  // Get all menu items
  getAllItems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      throw error;
    }
  },

  // Get menu items by category
  getItemsByCategory: async (category) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/${category}`);
      return await handleResponse(response);
    } catch (error) {
      console.error(`Failed to fetch ${category} items:`, error);
      throw error;
    }
  },

  // Generate a single combo
  generateCombo: async (usedItems = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/combo/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usedItems }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to generate combo:', error);
      throw error;
    }
  },

  // Generate multiple combos
  generateCombos: async (count = 3, usedItems = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/combos/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count, usedItems }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to generate combos:', error);
      throw error;
    }
  },

  // Generate weekly combos
  generateWeeklyCombos: async (viewMode = 'rolling', selectedDay = 'Monday', usedItems = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/combos/weekly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewMode, selectedDay, usedItems }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to generate weekly combos:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

export { ApiError };
export default menuApi;
