import React, { useState } from "react";
import { registerUser } from "../../services/authService.js";
import { Link } from "react-router-dom";
import styles from "./register.module.css";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    //   const handleSubmit = (event) => {
    //     event.preventDefault();

    //     console.log("Name:", name);
    //     console.log("Email:", email);
    //     console.log("Password:", password);
    //   };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        setMessage("");
        setError("");

        const userData = {
            name,
            email,
            password,
        };

        console.log("Data being sent:", userData);

        try {
            const data = await registerUser(userData);

            console.log("Backend response:", data);

            if (data.success) {
                setMessage(data.message);
            } else {
                setError(data.error?.message || "Registration failed");
            }

        } catch (error) {
            console.error("Registration failed:", error);
            setError("Unable to connect to the server, please try again later");
        }
        finally {
            setLoading(false);
        }
    };


    return (
        <div className={styles.registerPage} id="register-page">
            <div className={styles.registerContainer} id="register-container">

                <h1 className={styles.registerTitle} id="register-title">
                    Register
                </h1>

                {message && (
                    <p className={styles.message} id="register-message">
                        {message}
                    </p>
                )}

                {error && (
                    <p className={styles.error} id="register-error">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}></form>

                <form
                    onSubmit={handleSubmit}
                    className={styles.registerForm}
                    id="register-form"
                >
                    <div className={styles.formGroup} id="name-group">
                        <label className={styles.formLabel}>Name</label>
                        <input
                            className={styles.formInput}
                            id="name"
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>

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
                        className={styles.registerButton}
                        id="register-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className={styles.loginText} id="login-text">
                    Already have an account?{" "}
                    <Link
                        className={styles.loginLink}
                        id="login-link"
                        to="/login"
                    >
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Register;