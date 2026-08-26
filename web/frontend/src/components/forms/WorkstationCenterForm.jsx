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

function WorkstationCenterForm({ onCreated }) {
    const [heads, setHeads] = useState([]);
    const [loadingHeads, setLoadingHeads] = useState(true);

    const [name, setName] = useState("");
    const [head, setHead] = useState("");
    const [location, setLocation] = useState(INITIAL_LOCATION);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadHeads = async () => {
            try {
                const response = await getEligibleCenterHeads();

                setHeads(
                    Array.isArray(response)
                        ? response
                        : response.users || response.data || []
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

    const updateLocationField = (field, value) => {
        setLocation((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitting(true);

        try {
            const response = await createWorkstationCenter({
                name,
                head,
                location,
            });

            toast.success("Workstation center created successfully");

            setName("");
            setHead("");
            setLocation(INITIAL_LOCATION);

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
        return <Loading message="Loading center heads..." />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                id="center-name"
                label="Center Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter center name"
                required
            />

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
                    onChange={(event) => setHead(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="">Select workstation head</option>

                    {heads.map((item) => (
                        <option key={item._id} value={item._id}>
                            {item.name} - {item.email}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">
                    Location
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        placeholder="Street address"
                        required
                    />

                    <Input
                        id="location-city"
                        label="City"
                        value={location.city}
                        onChange={(event) =>
                            updateLocationField("city", event.target.value)
                        }
                        placeholder="City"
                        required
                    />

                    <Input
                        id="location-state"
                        label="State"
                        value={location.state}
                        onChange={(event) =>
                            updateLocationField("state", event.target.value)
                        }
                        placeholder="State"
                        required
                    />

                    <Input
                        id="location-postal-code"
                        label="Postal Code"
                        value={location.postalCode}
                        onChange={(event) =>
                            updateLocationField(
                                "postalCode",
                                event.target.value
                            )
                        }
                        placeholder="Postal code"
                        required
                    />

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
                        placeholder="Country"
                        required
                    />
                </div>
            </div>

            <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Center"}
            </Button>
        </form>
    );
}

export default WorkstationCenterForm;