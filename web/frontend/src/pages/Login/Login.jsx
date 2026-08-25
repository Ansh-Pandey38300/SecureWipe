import { useEffect, useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

function validateLoginForm(email, password) {
    const errors = {};

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
        errors.email = "Email is required.";
    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            trimmedEmail
        )
    ) {
        errors.email =
            "Please enter a valid email address.";
    } else if (trimmedEmail.length > 254) {
        errors.email =
            "Email address is too long.";
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 6) {
        errors.password =
            "Password must be at least 6 characters.";
    } else if (password.length > 128) {
        errors.password =
            "Password must not exceed 128 characters.";
    }

    return errors;
}

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);

    const {
        login,
        isAuthenticated,
        user,
    } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            return;
        }

        if (user.role === "ADMIN") {
            navigate("/admin/dashboard", {
                replace: true,
            });
        } else if (
            user.role === "WORKSTATION_HEAD"
        ) {
            navigate(
                "/workstation-head/dashboard",
                {
                    replace: true,
                }
            );
        } else if (
            user.role === "WORKSTATION_EMPLOYEE"
        ) {
            navigate(
                "/workstation-employee/dashboard",
                {
                    replace: true,
                }
            );
        } else if (
            user.role === "CUSTOMER"
        ) {
            navigate("/customer/dashboard", {
                replace: true,
            });
        }
    }, [
        isAuthenticated,
        user,
        navigate,
    ]);

    const handleEmailChange = (event) => {
        const value = event.target.value;

        setEmail(value);

        if (touched.email) {
            const validationErrors =
                validateLoginForm(
                    value,
                    password
                );

            setErrors((previousErrors) => {
                const nextErrors = {
                    ...previousErrors,
                };

                if (validationErrors.email) {
                    nextErrors.email =
                        validationErrors.email;
                } else {
                    delete nextErrors.email;
                }

                return nextErrors;
            });
        }
    };

    const handlePasswordChange = (event) => {
        const value = event.target.value;

        setPassword(value);

        if (touched.password) {
            const validationErrors =
                validateLoginForm(
                    email,
                    value
                );

            setErrors((previousErrors) => {
                const nextErrors = {
                    ...previousErrors,
                };

                if (validationErrors.password) {
                    nextErrors.password =
                        validationErrors.password;
                } else {
                    delete nextErrors.password;
                }

                return nextErrors;
            });
        }
    };

    const handleBlur = (field) => {
        setTouched((previousTouched) => ({
            ...previousTouched,
            [field]: true,
        }));

        const validationErrors =
            validateLoginForm(
                email,
                password
            );

        setErrors((previousErrors) => {
            const nextErrors = {
                ...previousErrors,
            };

            if (validationErrors[field]) {
                nextErrors[field] =
                    validationErrors[field];
            } else {
                delete nextErrors[field];
            }

            return nextErrors;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        const validationErrors =
            validateLoginForm(
                email,
                password
            );

        setErrors(validationErrors);

        setTouched({
            email: true,
            password: true,
        });

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            await login({
                email: email.trim(),
                password,
            });

            toast.success("Login successful");
        } catch (error) {
            toast.error(
                error.message ||
                "Unable to login"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-8">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
                <div className="mb-7 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Login
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to your SecureWipe account
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={
                                handleEmailChange
                            }
                            onBlur={() =>
                                handleBlur("email")
                            }
                            placeholder="Enter your email"
                            aria-invalid={Boolean(
                                errors.email
                            )}
                            aria-describedby={
                                errors.email
                                    ? "email-error"
                                    : undefined
                            }
                            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                                errors.email
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                            }`}
                        />

                        {errors.email && (
                            <p
                                id="email-error"
                                className="text-sm text-red-600"
                                role="alert"
                            >
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={
                                handlePasswordChange
                            }
                            onBlur={() =>
                                handleBlur("password")
                            }
                            placeholder="Enter your password"
                            aria-invalid={Boolean(
                                errors.password
                            )}
                            aria-describedby={
                                errors.password
                                    ? "password-error"
                                    : undefined
                            }
                            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                                errors.password
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                            }`}
                        />

                        {errors.password && (
                            <p
                                id="password-error"
                                className="text-sm text-red-600"
                                role="alert"
                            >
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        state={{
                            from: location.pathname,
                        }}
                        className="font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;