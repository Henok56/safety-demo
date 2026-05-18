import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import styles from "../styles/Login.module.css"; // Reuse the same CSS module

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await api.post("/auth/forgot-password", { 
        email: identifier.trim() 
      });
      setMessage(res.data.message || "Reset link sent to your email.");
      setIsError(false);
      setIdentifier(""); // Clear input on success
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to send reset link");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
          Enter your Staff ID or Email to receive a reset link.
        </p>

        {message && (
          <div 
            className={styles.message} 
            style={{ color: isError ? "#d93025" : "#188038", marginBottom: "15px" }}
          >
            {message}
          </div>
        )}

        <label>Staff ID / Email</label>
        <input
          type="text"
          placeholder="Enter Registration No. or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? <div className={styles.loadingSpinner}></div> : "Send Reset Link"}
          </button>

          <button
            type="button"
            className={styles.forgotPasswordBtn}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}