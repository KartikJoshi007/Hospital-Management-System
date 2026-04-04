import axios from "../../api/axios";

const extractError = (error) => {
  const data = error.response?.data
  if (data?.message) throw new Error(data.message)
  if (data?.errors?.length) throw new Error(data.errors[0].msg || data.errors[0].message)
  throw new Error(error.message || 'Something went wrong')
}

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    extractError(error)
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post("/auth/login", credentials); // ✅ API call

    const { token, user } = response.data.data;

    if (token) {
      localStorage.setItem("token", token);
      const sessionUser = {
        ...user,
        id: user._id || user.id,
        fullName: user.fullName || user.name || 'User'
      };
      localStorage.setItem("user", JSON.stringify(sessionUser));
    }

    return response.data;
  } catch (error) {
    extractError(error);
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
      const u = response.data.data;
      const sessionUser = {
        ...u,
        id: u._id || u.id,
        fullName: u.fullName || u.name || 'User'
      };
      localStorage.setItem("user", JSON.stringify(sessionUser));
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
