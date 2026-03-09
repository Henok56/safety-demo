import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import styles from "../styles/Login.module.css";

export default function Login() {
  const navigate = useNavigate();
  const [userid, setuserid] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/login", { userid, password });
      localStorage.setItem("accessToken", res.data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      navigate("/dashboard");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2>Well come Back!</h2>
        

        {message && <div className={styles.message}>{message}</div>}

        <label>Staff ID</label>
        <input
          type="text"
          placeholder="Enter Registration No."
          value={userid}
          onChange={(e) => setuserid(e.target.value)}
          required
          autoComplete="userid"
        />

        <label>Security Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? <div className={styles.loadingSpinner}></div> : "Login"}
          </button>

          <button
            type="button"
            className={styles.forgotPasswordBtn}
            onClick={() => navigate("/reset-password")}
          >
            Forget Password
          </button>
        </div>
      </form>
    </div>
  );
}