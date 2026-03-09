import axios from 'axios';

// 🚩 FIXED: Added /fdm to the baseURL
const API = axios.create({ baseURL: "http://10.0.68.42:5000/api/fdm" });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const fdmApi = {
    // These will now call http://10.0.68.42:5000/api/fdm/
    getAllEvents: () => API.get('/'),

    // PUT for general edits (UpdateEvent)
    updateEvent: (id, data) => API.put(`/${id}`, data),

    // PATCH for closing (CloseEvent)
    closeEvent: (id, updateData) => API.patch(`/${id}/close`, updateData),

    // DELETE 
    deleteEvent: (id) => API.delete(`/${id}`),

    createEvent: (data) => API.post('/', data),
    
    uploadAttachment: (id, formData) => API.post(`/${id}/attach`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export default fdmApi;