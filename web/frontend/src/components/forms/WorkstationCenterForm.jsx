import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getEligibleCenterHeads } from "../../services/userService";
import { createWorkstationCenter } from "../../services/workstationCenterService";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Loading from "../common/Loading";

const INITIAL_LOCATION = {
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
};

function validateWorkstationCenterForm(
    name,
    head,
    location
) {
    const errors = {};

    const trimmedName = name.trim();
    const trimmedAddress = location.address.trim();
    const trimmedCity = location.city.trim();
    const trimmedState = location.state.trim();
    const trimmedPostalCode =
        location.postalCode.trim();
    const trimmedCountry = location.country.trim();

    if (!trimmedName) {
        errors.name = "Center name is required.";
    } else if (trimmedName.length < 2) {
        errors.name =
            "Center name must be at least 2 characters.";
    } else if (trimmedName.length > 100) {
        errors.name =
            "Center name must not exceed 100 characters.";
    }

    if (!head) {
        errors.head =
            "Please select a workstation head.";
    }

    if (!trimmedAddress) {
        errors.address = "Address is required.";
    } else if (trimmedAddress.length < 5) {
        errors.address =
            "Address must be at least 5 characters.";
    } else if (trimmedAddress.length > 250) {
        errors.address =
            "Address must not exceed 250 characters.";
    }

    if (!trimmedCity) {
        errors.city = "City is required.";
    } else if (trimmedCity.length < 2) {
        errors.city =
            "City must be at least 2 characters.";
    } else if (trimmedCity.length > 100) {
        errors.city =
            "City must not exceed 100 characters.";
    }

    if (!trimmedState) {
        errors.state = "State is required.";
    } else if (trimmedState.length < 2) {
        errors.state =
            "State must be at least 2 characters.";
    } else if (trimmedState.length > 100) {
        errors.state =
            "State must not exceed 100 characters.";
    }

    if (!trimmedPostalCode) {
        errors.postalCode =
            "Postal code is required.";
    } else if (
        !/^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/.test(
            trimmedPostalCode
        )
    ) {
        errors.postalCode =
            "Please enter a valid postal code.";
    }

    if (!trimmedCountry) {
        errors.country = "Country is required.";
    } else if (trimmedCountry.length < 2) {
        errors.country =
            "Country must be at least 2 characters.";
    } else if (trimmedCountry.length > 100) {
        errors.country =
            "Country must not exceed 100 characters.";
    }

    return errors;
}

function WorkstationCenterForm({ onCreated }) {
    const [heads, setHeads] = useState([]);
    const [loadingHeads, setLoadingHeads] = useState(true);

    const [name, setName] = useState("");
    const [head, setHead] = useState("");
    const [location, setLocation] =
        useState(INITIAL_LOCATION);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const [submitting, setSubmitting] =
        useState(false);

    useEffect(() => {
        const loadHeads = async () => {
            try {
                const response =
                    await getEligibleCenterHeads();

                setHeads(
                    Array.isArray(response)
                        ? response
                        : response.users ||
                        response.data ||
                        []
                );
            } catch (error) {
                toast.error(
                    error.message ||
                    "Unable to load eligible center heads."
                );
            } finally {
                setLoadingHeads(false);
            }
        };

        loadHeads();
    }, []);

    const updateLocationField = (
        field,
        value
    ) => {
        const updatedLocation = {
            ...location,
            [field]: value,
        };

        setLocation(updatedLocation);

        if (touched[field]) {
            const validationErrors =
                validateWorkstationCenterForm(
                    name,
                    head,
                    updatedLocation
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
        }
    };

    const handleFieldBlur = (field) => {
        setTouched((previousTouched) => ({
            ...previousTouched,
            [field]: true,
        }));

        const validationErrors =
            validateWorkstationCenterForm(
                name,
                head,
                location
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

    const handleNameChange = (event) => {
        const value = event.target.value;

        setName(value);

        if (touched.name) {
            const validationErrors =
                validateWorkstationCenterForm(
                    value,
                    head,
                    location
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

    const handleHeadChange = (event) => {
        const value = event.target.value;

        setHead(value);

        if (touched.head) {
            const validationErrors =
                validateWorkstationCenterForm(
                    name,
                    value,
                    location
                );

            setErrors((previousErrors) => {
                const nextErrors = {
                    ...previousErrors,
                };

                if (validationErrors.head) {
                    nextErrors.head =
                        validationErrors.head;
                } else {
                    delete nextErrors.head;
                }

                return nextErrors;
            });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) {
            return;
        }

        const validationErrors =
            validateWorkstationCenterForm(
                name,
                head,
                location
            );

        setErrors(validationErrors);

        setTouched({
            name: true,
            head: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
        });

        if (
            Object.keys(validationErrors).length > 0
        ) {
            return;
        }

        setSubmitting(true);

        try {
            const response =
                await createWorkstationCenter({
                    name: name.trim(),
                    head,
                    location: {
                        address:
                            location.address.trim(),
                        city: location.city.trim(),
                        state:
                            location.state.trim(),
                        postalCode:
                            location.postalCode.trim(),
                        country:
                            location.country.trim(),
                    },
                });

            toast.success(
                "Workstation center created successfully"
            );

            setName("");
            setHead("");
            setLocation(INITIAL_LOCATION);
            setErrors({});
            setTouched({});

            if (onCreated) {
                onCreated(response);
            }
        } catch (error) {
            toast.error(
                error.message ||
                "Unable to create workstation center."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingHeads) {
        return (
            <Loading
                message="Loading center heads..."
            />
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
        >
            <div>
                <Input
                    id="center-name"
                    label="Center Name"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={() =>
                        handleFieldBlur("name")
                    }
                    placeholder="Enter center name"
                    required
                />

                {errors.name && (
                    <p
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                    >
                        {errors.name}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="center-head"
                    className="block text-sm font-medium text-slate-700"
                >
                    Workstation Head
                </label>

                <select
                    id="center-head"
                    value={head}
                    onChange={handleHeadChange}
                    onBlur={() =>
                        handleFieldBlur("head")
                    }
                    required
                    aria-invalid={Boolean(
                        errors.head
                    )}
                    aria-describedby={
                        errors.head
                            ? "center-head-error"
                            : undefined
                    }
                    className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ${errors.head
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                        }`}
                >
                    <option value="">
                        Select workstation head
                    </option>

                    {heads.map((item) => (
                        <option
                            key={item._id}
                            value={item._id}
                        >
                            {item.name} - {item.email}
                        </option>
                    ))}
                </select>

                {errors.head && (
                    <p
                        id="center-head-error"
                        className="text-sm text-red-600"
                        role="alert"
                    >
                        {errors.head}
                    </p>
                )}
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">
                    Location
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Input
                            id="location-address"
                            label="Address"
                            value={location.address}
                            onChange={(event) =>
                                updateLocationField(
                                    "address",
                                    event.target.value
                                )
                            }
                            onBlur={() =>
                                handleFieldBlur(
                                    "address"
                                )
                            }
                            placeholder="Street address"
                            required
                        />

                        {errors.address && (
                            <p
                                className="mt-1 text-sm text-red-600"
                                role="alert"
                            >
                                {errors.address}
                            </p>
                        )}
                    </div>

                    <div>
                        <Input
                            id="location-city"
                            label="City"
                            value={location.city}
                            onChange={(event) =>
                                updateLocationField(
                                    "city",
                                    event.target.value
                                )
                            }
                            onBlur={() =>
                                handleFieldBlur("city")
                            }
                            placeholder="City"
                            required
                        />

                        {errors.city && (
                            <p
                                className="mt-1 text-sm text-red-600"
                                role="alert"
                            >
                                {errors.city}
                            </p>
                        )}
                    </div>

                    <div>
                        <Input
                            id="location-state"
                            label="State"
                            value={location.state}
                            onChange={(event) =>
                                updateLocationField(
                                    "state",
                                    event.target.value
                                )
                            }
                            onBlur={() =>
                                handleFieldBlur("state")
                            }
                            placeholder="State"
                            required
                        />

                        {errors.state && (
                            <p
                                className="mt-1 text-sm text-red-600"
                                role="alert"
                            >
                                {errors.state}
                            </p>
                        )}
                    </div>

                    <div>
                        <Input
                            id="location-postal-code"
                            label="Postal Code"
                            value={
                                location.postalCode
                            }
                            onChange={(event) =>
                                updateLocationField(
                                    "postalCode",
                                    event.target.value
                                )
                            }
                            onBlur={() =>
                                handleFieldBlur(
                                    "postalCode"
                                )
                            }
                            placeholder="Postal code"
                            required
                        />

                        {errors.postalCode && (
                            <p
                                className="mt-1 text-sm text-red-600"
                                role="alert"
                            >
                                {errors.postalCode}
                            </p>
                        )}
                    </div>

                    <div>
                        <Input
                            id="location-country"
                            label="Country"
                            value={location.country}
                            onChange={(event) =>
                                updateLocationField(
                                    "country",
                                    event.target.value
                                )
                            }
                            onBlur={() =>
                                handleFieldBlur(
                                    "country"
                                )
                            }
                            placeholder="Country"
                            required
                        />

                        {errors.country && (
                            <p
                                className="mt-1 text-sm text-red-600"
                                role="alert"
                            >
                                {errors.country}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={submitting}
            >
                {submitting
                    ? "Creating..."
                    : "Create Center"}
            </Button>
        </form>
    );
}

export default WorkstationCenterForm;