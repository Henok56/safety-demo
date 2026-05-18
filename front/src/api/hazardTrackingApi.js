// src/api/hazardTrackingApi.js
import api from "../api";

const BASE_URL = "/hazard-tracking";

const hazardTrackingApi = {
  // ==================== CREATE ====================
  /**
   * Log a new hazard (manual entry)
   * @param {Object} data - { sequentialNumber, submittedAt }
   */
  logHazard: async (data) => {
    try {
      console.log("Logging hazard with data:", data);
      const response = await api.post(`${BASE_URL}`, {
        sequentialNumber: data.sequentialNumber,
        submittedAt: data.submittedAt
      });
      return response.data;
    } catch (error) {
      console.error("Error logging hazard:", error);
      throw error;
    }
  },

  // ==================== GET MY DATA ====================
  /**
   * Get my current month's hazard submission status
   * @param {Object} params - { month, year } (optional)
   */
  getMyStatus: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${BASE_URL}/my-status?${queryString}` : `${BASE_URL}/my-status`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching my status:", error);
      // Return default data instead of throwing
      return { 
        success: true, 
        data: { 
          submitted: 0, 
          required: 4, 
          compliant: false, 
          remaining: 4, 
          hazardIds: [] 
        } 
      };
    }
  },

  /**
   * Get my complete hazard history
   */
  getMyHistory: async () => {
    try {
      const response = await api.get(`${BASE_URL}/my-history`);
      return response.data;
    } catch (error) {
      console.error("Error fetching my history:", error);
      // Return empty data instead of throwing
      return { 
        success: true, 
        data: { 
          total: 0, 
          all: [], 
          monthly: [] 
        } 
      };
    }
  },

  /**
   * Get single hazard by ID
   * @param {string} id - Hazard record ID
   */
  getHazardById: async (id) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching hazard by ID:", error);
      throw error;
    }
  },

  // ==================== UPDATE ====================
  /**
   * Update a hazard record
   * @param {string} id - Hazard record ID
   * @param {Object} data - { sequentialNumber, submittedAt }
   */
  updateHazard: async (id, data) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, {
        sequentialNumber: data.sequentialNumber,
        submittedAt: data.submittedAt
      });
      return response.data;
    } catch (error) {
      console.error("Error updating hazard:", error);
      throw error;
    }
  },

  // ==================== DELETE ====================
  /**
   * Soft delete (archive) a hazard
   * @param {string} id - Hazard record ID
   */
  deleteHazard: async (id) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting hazard:", error);
      throw error;
    }
  },

  // ==================== HELPER METHODS ====================
  /**
   * Generate hazard ID from sequential number
   * @param {string|number} sequentialNumber
   * @returns {string}
   */
  generateHazardId: (sequentialNumber) => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `HAZ-FLT-${sequentialNumber}-${month}${year}`;
  },

  /**
   * Validate hazard ID format
   * @param {string} hazardId
   * @returns {boolean}
   */
  validateHazardId: (hazardId) => {
    const regex = /^HAZ-FLT-\d+-\d{6}$/i;
    return regex.test(hazardId);
  },

  /**
   * Format hazard ID to uppercase standard
   * @param {string} hazardId
   * @returns {string}
   */
  formatHazardId: (hazardId) => {
    return hazardId.toUpperCase().trim();
  },

  /**
   * Extract sequential number from hazard ID
   * @param {string} hazardId
   * @returns {string|null}
   */
  extractSequentialNumber: (hazardId) => {
    const match = hazardId.match(/HAZ-FLT-(\d+)-/i);
    return match ? match[1] : null;
  },

  /**
   * Extract month and year from hazard ID
   * @param {string} hazardId
   * @returns {Object|null} { month, year, monthYear }
   */
  extractDateFromHazardId: (hazardId) => {
    const match = hazardId.match(/HAZ-FLT-\d+-(\d{2})(\d{4})/i);
    if (match) {
      const month = match[1];
      const year = match[2];
      return { month, year, monthYear: `${month}-${year}` };
    }
    return null;
  }
};

export default hazardTrackingApi;