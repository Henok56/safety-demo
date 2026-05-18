import api from "../api";

const BASE_URL = "/culture-compliance";

const cultureComplianceApi = {
  // ==================== NEW RECOMMENDED METHODS ====================
  
  // Create record with first entry (one-step operation)
  createRecordWithEntry: async (employeeId, aspect, score, reason) => {
    try {
      const response = await api.post(`${BASE_URL}/create-with-entry`, {
        employeeId,
        aspect,
        score,
        reason: reason || ""
      });
      return response.data;
    } catch (error) {
      console.error("Error in createRecordWithEntry:", error);
      throw error;
    }
  },
  
  // Bulk create multiple entries at once
  bulkCreateEntries: async (employeeId, entries) => {
    try {
      const response = await api.post(`${BASE_URL}/bulk-create`, {
        employeeId,
        entries
      });
      return response.data;
    } catch (error) {
      console.error("Error in bulkCreateEntries:", error);
      throw error;
    }
  },
  
  // ==================== GET METHODS ====================
  
  // Get all culture records
  getAllRecords: async () => {
    try {
      const response = await api.get(`${BASE_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching culture records:", error);
      return { success: true, data: [] };
    }
  },
  
  // Get single culture record by ID
  getRecordById: async (id) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching culture record:", error);
      throw error;
    }
  },
  
  // Get culture record by employee ID
  getRecordByEmployee: async (employeeId) => {
    try {
      const response = await api.get(`${BASE_URL}/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching employee culture record:", error);
      return null;
    }
  },
  
  // ==================== CREATE METHODS (Legacy) ====================
  
  // Create new culture record (without entry)
  createRecord: async (data) => {
    try {
      const response = await api.post(`${BASE_URL}`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating culture record:", error);
      throw error;
    }
  },
  
  // Add aspect entry to existing record
  addAspectEntry: async (id, data) => {
    try {
      const response = await api.post(`${BASE_URL}/${id}/aspect`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding aspect entry:", error);
      throw error;
    }
  },
  
  // ==================== UPDATE METHODS ====================
  
  // Update aspect history entry
  updateAspectHistoryEntry: async (recordId, historyId, data) => {
    try {
      const response = await api.put(`${BASE_URL}/${recordId}/history/${historyId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating history entry:", error);
      throw error;
    }
  },
  
  // ==================== DELETE METHODS ====================
  
  // Delete aspect history entry
  deleteHistoryEntry: async (recordId, historyId) => {
    try {
      const response = await api.delete(`${BASE_URL}/${recordId}/history/${historyId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting history entry:", error);
      throw error;
    }
  },
  
  // Delete entire culture record
  deleteRecord: async (id) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting culture record:", error);
      throw error;
    }
  },
  
  // Add adjustment (penalty/reward)
  addAdjustment: async (id, data) => {
    try {
      const response = await api.post(`${BASE_URL}/${id}/adjustment`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding adjustment:", error);
      throw error;
    }
  },
};

export default cultureComplianceApi;