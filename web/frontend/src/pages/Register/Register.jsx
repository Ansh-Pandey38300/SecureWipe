import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import { registerUser } from "../../services/authService";

function validateRegisterForm(
    name,
    email,
    password
) {
    const errors = {};

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
        errors.name = "Name is required.";
    } else if (trimmedName.length < 2) {
        errors.name =
            "Name must be at least 2 characters.";
    } else if (trimmedName.length > 100) {
        errors.name =
            "Name must not exceed 100 characters.";
    }

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
        errors.password =
            "Password is required.";
    } else if (password.length < 6) {
        errors.password =
            "Password must be at least 6 characters.";
    } else if (password.length > 128) {
        errors.password =
            "Password must not exceed 128 characters.";
    }

    return errors;
}

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleNameChange = (event) => {
        const value = event.target.value;

        setName(value);

        if (touched.name) {
            const validationErrors =
                validateRegisterForm(
                    value,
                    email,
                    password
                );

            setErrors((previousErrors) => {
                const nextErrors = {
                    ...previousErrors,
                };

                if (validationErrors.name) {
                    nextErrors.name =
                        validationErrors.name;
                } else {
                    delete nextErrors.name;
                }

                return nextErrors;
            });
        }
    };

    const handleEmailChange = (event) => {
        const value = event.target.value;

        setEmail(value);

        if (touched.email) {
            const validationErrors =
                validateRegisterForm(
                    name,
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
                validateRegisterForm(
                    name,
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
            validateRegisterForm(
                name,
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
            validateRegisterForm(
                name,
                email,
                password
            );

        setErrors(validationErrors);

        setTouched({
            name: true,
            email: true,
            password: true,
        });

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            const response =
                await registerUser({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                });

            toast.success(
                response.message ||
                "Registration successful"
            );

            setName("");
            setEmail("");
            setPassword("");
            setErrors({});
            setTouched({});

            navigate("/login");
        } catch (error) {
            toast.error(
                error.message ||
                "Registration failed"
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
                        Register
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Create your SecureWipe account
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={
                                handleNameChange
                            }
                            onBlur={() =>
                                handleBlur("name")
                            }
                            placeholder="Enter your name"
                            aria-invalid={Boolean(
                                errors.name
                            )}
                            aria-describedby={
                                errors.name
                                    ? "register-name-error"
                                    : undefined
                            }
                            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
                                errors.name
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                            }`}
                        />

                        {errors.name && (
                            <p
                                id="register-name-error"
                                className="text-sm text-red-600"
                                role="alert"
                            >
                                {errors.name}
                            </p>
                        )}
                    </div>

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
                                    ? "register-email-error"
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
                                id="register-email-error"
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
                                    ? "register-password-error"
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
                                id="register-password-error"
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
                            ? "Registering..."
                            : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;