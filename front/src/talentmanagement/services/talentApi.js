import api from "../../api";

// Employees
export const getEmployees = () => api.get("/employees");

// Career Development
export const addCareer = (data) => api.post("/career", data);
export const getCareer = (id) => api.get(`/career/${id}`);

// Recurrent Training
export const addRecurrent = (data) => api.post("/recurrent", data);

// Leadership Development
export const addLeadership = (data) => api.post("/leadership", data);

// Coaching
export const addCoaching = (data) => api.post("/coaching", data);

// Succession Planning
export const addSuccession = (data) => api.post("/succession", data);
