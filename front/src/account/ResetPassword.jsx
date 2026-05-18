import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import styles from "../styles/Login.module.css"; // Reuse the same CSS module for consistency

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // Frontend Validations
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(`/auth/reset-password`, {
        email: email.trim(),
        password,
        confirmPassword, 
      });

      setIsError(false);
      setMessage(res.data.message || "Password reset successfully!");

      // Redirect to login after a short delay so user can read the message
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.error("Reset password error:", err);
      setIsError(true);
      setMessage(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
          Enter your email and choose a new secure password.
        </p>

        {message && (
          <div 
            className={styles.message} 
            style={{ 
              color: isError ? "#d93025" : "#188038", 
              backgroundColor: isError ? "#fce8e6" : "#e6f4ea",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              fontSize: "14px"
            }}
          >
            {message}
          </div>
        )}

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>New Password</label>
        <input
          type="password"
          placeholder=""
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Confirm New Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? <div className={styles.loadingSpinner}></div> : "Set New Password"}
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