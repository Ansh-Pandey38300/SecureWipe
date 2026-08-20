import React, { useState } from "react";
import { registerUser } from "../../services/authService.js";
import { Link } from "react-router-dom";

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
            setError("Unable to connect to the server");
        }
        finally {
            setLoading(false);
        }
    };



    return (
        <div>
            <h1>Register</h1>

            {message && <p>{message}</p>}

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}></form>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>

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
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
            <p>
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Register;