const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiFetch = async (endpoint, options = {}) => {
  const clerkId = localStorage.getItem('clerk-user-id');
  const clerkName = localStorage.getItem('clerk-user-name');
  const clerkEmail = localStorage.getItem('clerk-user-email');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (clerkId) {
    config.headers['x-clerk-user-id'] = clerkId;
  }
  if (clerkName) {
    config.headers['x-clerk-username'] = clerkName;
  }
  if (clerkEmail) {
    config.headers['x-clerk-user-email'] = clerkEmail;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP ${response.status}` };
    }
    const error = new Error(errorData.message || `API error: ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response.json();
};

// Videos
export const getVideos = () => apiFetch('/videos');

export const getGoals = () => apiFetch('/goals');
export const createGoal = (data) => apiFetch('/goals', { method: 'POST', body: JSON.stringify(data) });
export const updateGoal = (id, data) => apiFetch(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteGoal = (id) => apiFetch(`/goals/${id}`, { method: 'DELETE' });

export const getLogs = () => apiFetch('/logs');
export const createLog = (data) => apiFetch('/logs', { method: 'POST', body: JSON.stringify(data) });
export const updateLog = (id, data) => apiFetch(`/logs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const getHeatmap = (days = 365) => apiFetch(`/heatmap?days=${days}`);

export const getMe = () => apiFetch('/users/me');

export const chatWithAI = (message) => apiFetch('/ai/chat', { 
  method: 'POST', 
  body: JSON.stringify({ message }) 
});

// User Discovery & Leaderboard
export const getAllUsers = () => apiFetch('/users');
export const getLeaderboard = () => apiFetch('/users/leaderboard');
export const updateGoalType = (data) => apiFetch('/users/goal', { method: 'PATCH', body: JSON.stringify(data) });

// Weight Tracking
export const getWeightLogs = () => apiFetch('/weight');
export const logWeight = (data) => apiFetch('/weight', { method: 'POST', body: JSON.stringify(data) });

// Social (Friends & Messages)
export const getFriends = () => apiFetch('/social/friends');
export const addFriend = (id) => apiFetch(`/social/friends/${id}`, { method: 'POST' });
export const getMessages = (friendId) => apiFetch(`/social/messages/${friendId}`);
export const sendMessage = (data) => apiFetch('/social/messages', { method: 'POST', body: JSON.stringify(data) });

// Nutrition
export const getNutrition = () => apiFetch('/nutrition');
export const logMeal = (data) => apiFetch('/nutrition/meal', { method: 'POST', body: JSON.stringify(data) });
export const getDailyCalories = () => apiFetch('/nutrition/daily-calories');
