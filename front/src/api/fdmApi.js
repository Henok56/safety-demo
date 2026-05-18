import axios from 'axios';

// ✅ Uses nginx proxy — works for localhost AND office network
const API = axios.create({ baseURL: "/api/fdm" });

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
    getAllEvents: () => API.get('/'),
    updateEvent: (id, data) => API.put(`/${id}`, data),
    closeEvent: (id, updateData) => API.patch(`/${id}/close`, updateData),
    deleteEvent: (id) => API.delete(`/${id}`),
    createEvent: (data) => API.post('/', data),
    uploadAttachment: (id, formData) => API.post(`/${id}/attach`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export default fdmApi;