import { useState } from "react";

import { getWorkstationCenter } from "../../../services/workstationCenterService";

import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import WorkstationCenterForm from "../../../components/forms/WorkstationCenterForm";
import WorkstationCenterDetails from "../../../components/workstation/WorkstationCenterDetails";
import AssignEmployeesPanel from "../../../components/workstation/AssignEmployeesPanel";

function AdminWorkstationCenters() {
    const [lookupId, setLookupId] = useState("");
    const [viewedCenter, setViewedCenter] = useState(null);
    const [loadingCenter, setLoadingCenter] = useState(false);
    const [lookupError, setLookupError] = useState("");

    const loadCenter = async (centerId) => {
        if (!centerId) {
            return;
        }

        setLoadingCenter(true);
        setLookupError("");

        try {
            const response = await getWorkstationCenter(centerId);
            setViewedCenter(response.data || response.center || response);
        } catch (error) {
            setViewedCenter(null);
            setLookupError(
                error.message || "Unable to load workstation center."
            );
        } finally {
            setLoadingCenter(false);
        }
    };

    const handleCreated = (response) => {
        const created = response.data || response.center || response;

        if (created?.centerId) {
            setLookupId(created.centerId);
            setViewedCenter(created);
            setLookupError("");
        }
    };

    const handleLookupSubmit = (event) => {
        event.preventDefault();
        loadCenter(lookupId.trim());
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Workstation Centers"
                description="Create a workstation center and manage it using its center ID."
            />

            <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">
                    Create Workstation Center
                </h2>

                <WorkstationCenterForm onCreated={handleCreated} />
            </div>

            <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-1 text-base font-semibold text-slate-900">
                    View Workstation Center
                </h2>

                <p className="mb-4 text-sm text-slate-500">
                    There is no backend endpoint to list all workstation
                    centers, so look one up by its center ID. A newly
                    created center loads here automatically.
                </p>

                <form
                    onSubmit={handleLookupSubmit}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                    <div className="flex-1">
                        <Input
                            id="lookup-center-id"
                            label="Center ID"
                            value={lookupId}
                            onChange={(event) =>
                                setLookupId(event.target.value)
                            }
                            placeholder="Enter center ID"
                        />
                    </div>

                    <Button type="submit" disabled={loadingCenter}>
                        {loadingCenter ? "Loading..." : "Load Center"}
                    </Button>
                </form>
            </div>

            {loadingCenter && (
                <Loading message="Loading workstation center..." />
            )}

            {!loadingCenter && lookupError && (
                <ErrorMessage message={lookupError} />
            )}

            {!loadingCenter && viewedCenter && (
                <div className="max-w-xl space-y-6">
                    <WorkstationCenterDetails center={viewedCenter} />

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-900">
                            Assign Employees
                        </h2>

                        <AssignEmployeesPanel
                            centerId={viewedCenter.centerId}
                            existingEmployees={viewedCenter.employees || []}
                            onAssigned={() => loadCenter(viewedCenter.centerId)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminWorkstationCenters;