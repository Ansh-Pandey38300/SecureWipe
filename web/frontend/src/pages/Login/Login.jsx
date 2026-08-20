import React, { useState } from "react";
import { loginUser } from "../../services/authService";
import { Link } from "react-router-dom";
import styles from "./login.module.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        setMessage("");
        setError("");

        const loginData = {
            email,
            password
        };

        console.log("Login data:", loginData);

        try {
            const data = await loginUser(loginData);

            console.log("Backend response:", data);

            if (data.success) {
                setMessage(data.message);
            } else {
                setError(data.error?.message || "Login failed");
            }
        } catch (error) {
            console.error("Login failed:", error);
            setError(error.message || "Unable to connect to the server, please try again later");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage} id="login-page">
            <div className={styles.loginContainer} id="login-container">
                <h1 className={styles.loginTitle} id="login-title">Login</h1>

                {message && (
                    <p className={styles.message} id="login-message">
                        {message}
                    </p>
                )}

                {error && (
                    <p className={styles.error} id="login-error">
                        {error}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className={styles.loginForm}
                    id="login-form"
                >
                    <div className={styles.formGroup} id="email-group">
                        <label className={styles.formLabel}>Email</label>
                        <input
                            className={styles.formInput}
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup} id="password-group">
                        <label className={styles.formLabel}>Password</label>
                        <input
                            className={styles.formInput}
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <button
                        className={styles.loginButton}
                        id="login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className={styles.registerText} id="register-text">
                    Don't have an account?{" "}
                    <Link
                        className={styles.registerLink}
                        id="register-link"
                        to="/register"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;