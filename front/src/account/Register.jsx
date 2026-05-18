import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; 
import { UserPlus, Shield, User, Mail, Lock, Briefcase } from "lucide-react"; 
import "../styles/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    userid: "",
    email: "",
    password: "",
    role: "user"
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      /** * 🚩 FIT CHECK: 
       * Sending firstname, lastname, userid, email, password, and role.
       * This matches the 'const { ... } = req.body' in your authController.
       */
      const res = await api.post("/auth/register", formData);
      
      setMessage({ text: "Account created successfully! Please log in.", type: "success" });
      
      // Redirect to login after successful registration
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // Catching specific backend validation errors
      const errorMsg = err.response?.data?.message || "Registration failed. Please check inputs.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-header">
          <div className="icon-circle">
            <UserPlus size={28} color="#fff" />
          </div>
          <h2>Register Personnel</h2>
          <p>Initialize a new user staff account</p>
        </div>

        {message.text && (
          <div className={`alert-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-grid-form">
          <div className="input-row">
            <div className="input-group">
              <label><User size={16}/> First Name</label>
              <input name="firstname" value={formData.firstname} onChange={handleChange} required placeholder="John" />
            </div>

            <div className="input-group">
              <label><User size={16}/> Last Name</label>
              <input name="lastname" value={formData.lastname} onChange={handleChange} required placeholder="Doe" />
            </div>
          </div>

          <div className="input-group">
            <label><Shield size={16}/> Staff ID / Reg No.</label>
            <input name="userid" value={formData.userid} onChange={handleChange} required placeholder="Ex: 36365" />
          </div>

          <div className="input-group">
            <label><Mail size={16}/> Official Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="staff@airline.com" />
          </div>

          <div className="input-group">
            <label><Lock size={16}/> Temporary Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
          </div>

          {/* 🚩 NEW: ROLE SELECTION DROPDOWN */}
          <input type="hidden" name="role" value="user" />

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}