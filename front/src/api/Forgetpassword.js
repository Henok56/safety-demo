import api from "../api"; // use your axios instance

/**
 * Send forgot password request
 * @param {string} email
 * @returns {Promise<object>}
 */
export const sendForgotPasswordEmail = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    // Axios errors can be nested differently depending on the server
    const message =
      error.response?.data?.message ||
      error.message ||
      "Server not reachable";
    throw new Error(message);
  }
};
