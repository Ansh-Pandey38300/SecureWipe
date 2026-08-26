import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { getWorkstationCenter } from "../../../services/workstationCenterService";

import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import WorkstationCenterDetails from "../../../components/workstation/WorkstationCenterDetails";

function CustomerDashboard() {
    const { user } = useAuth();

    const [centerId, setCenterId] = useState("");
    const [center, setCenter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedId = centerId.trim();

        if (!trimmedId) {
            toast.error("Enter a center ID");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await getWorkstationCenter(trimmedId);
            setCenter(response.data || response.center || response);
        } catch (error) {
            setCenter(null);
            setError(
                error.message || "Unable to load workstation center."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Customer Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Welcome, {user?.name}.
                </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-1 text-base font-semibold text-slate-900">
                    Find a Workstation Center
                </h2>

                <p className="mb-4 text-sm text-slate-500">
                    SecureWipe doesn't currently offer a directory of
                    workstation centers here. Enter the center ID you were
                    given to view its details.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                    <div className="flex-1">
                        <Input
                            id="customer-center-id"
                            label="Center ID"
                            value={centerId}
                            onChange={(event) =>
                                setCenterId(event.target.value)
                            }
                            placeholder="Enter center ID"
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "View Center"}
                    </Button>
                </form>
            </div>

            {loading && <Loading message="Loading workstation center..." />}

            {!loading && error && <ErrorMessage message={error} />}

            {!loading && center && (
                <WorkstationCenterDetails center={center} />
            )}
        </div>
    );
}

export default CustomerDashboard;