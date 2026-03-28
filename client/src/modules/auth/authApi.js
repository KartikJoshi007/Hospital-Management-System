import axios from "../api/axios";

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post("/auth/login", credentials);
    if (response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get current user
export const getMe = async () => {
  try {
    const response = await axios.get("/auth/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update profile
export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put("/auth/profile", profileData);
    if (response.data.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.put("/auth/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await axios.get("/auth/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Deactivate account
export const deactivateAccount = async () => {
  try {
    const response = await axios.put("/auth/deactivate");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all users (Admin only)
export const getAllUsers = async () => {
  try {
    const response = await axios.get("/auth/users");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user by ID (Admin only)
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
