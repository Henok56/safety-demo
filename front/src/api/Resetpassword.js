// src/api/Resetpassword.js
import api from "../api"; // use your centralized axios instance

/**
 * Send password reset request
 * @param {string} email
 * @returns {Promise<object>}
 */
export const requestPasswordReset = async (email) => {
  try {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data; // { success, message }
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Failed to send reset link";
    console.error(message);
    throw new Error(message);
  }
};
