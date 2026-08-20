import React, { useState } from "react";
import { loginUser } from "../../services/authService";
import { Link } from "react-router-dom";
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
            password,
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
            setError(error.message || "Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            {message && <p>{message}</p>}
            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <p>
                Don't have an account?{" "}
                <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default Login;