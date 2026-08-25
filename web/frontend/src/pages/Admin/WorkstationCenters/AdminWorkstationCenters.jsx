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

function validateCenterId(centerId) {
    const errors = {};
    const trimmedId = centerId.trim();

    if (!trimmedId) {
        errors.centerId = "Center ID is required.";
    } else if (trimmedId.length < 2) {
        errors.centerId =
            "Center ID must be at least 2 characters.";
    } else if (trimmedId.length > 100) {
        errors.centerId =
            "Center ID must not exceed 100 characters.";
    }

    return errors;
}

function AdminWorkstationCenters() {
    const [lookupId, setLookupId] = useState("");
    const [viewedCenter, setViewedCenter] =
        useState(null);
    const [loadingCenter, setLoadingCenter] =
        useState(false);
    const [lookupError, setLookupError] =
        useState("");
    const [validationError, setValidationError] =
        useState("");

    const loadCenter = async (centerId) => {
        setLoadingCenter(true);
        setLookupError("");

        try {
            const response =
                await getWorkstationCenter(centerId);

            setViewedCenter(
                response.data ||
                    response.center ||
                    response
            );
        } catch (error) {
            setViewedCenter(null);
            setLookupError(
                error.message ||
                    "Unable to load workstation center."
            );
        } finally {
            setLoadingCenter(false);
        }
    };

    const handleCreated = (response) => {
        const created =
            response.data ||
            response.center ||
            response;

        if (created?.centerId) {
            setLookupId(created.centerId);
            setViewedCenter(created);
            setLookupError("");
            setValidationError("");
        }
    };

    const handleLookupChange = (event) => {
        const value = event.target.value;

        setLookupId(value);
        setLookupError("");

        if (validationError) {
            const errors = validateCenterId(value);

            setValidationError(
                errors.centerId || ""
            );
        }
    };

    const handleLookupBlur = () => {
        const errors =
            validateCenterId(lookupId);

        setValidationError(
            errors.centerId || ""
        );
    };

    const handleLookupSubmit = async (event) => {
        event.preventDefault();

        if (loadingCenter) {
            return;
        }

        const errors =
            validateCenterId(lookupId);

        setValidationError(
            errors.centerId || ""
        );

        if (errors.centerId) {
            return;
        }

        await loadCenter(lookupId.trim());
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

                <WorkstationCenterForm
                    onCreated={handleCreated}
                />
            </div>

            <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-1 text-base font-semibold text-slate-900">
                    View Workstation Center
                </h2>

                <p className="mb-4 text-sm text-slate-500">
                    There is no backend endpoint to
                    list all workstation centers, so
                    look one up by its center ID. A
                    newly created center loads here
                    automatically.
                </p>

                <form
                    onSubmit={handleLookupSubmit}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                    noValidate
                >
                    <div className="flex-1">
                        <Input
                            id="lookup-center-id"
                            label="Center ID"
                            value={lookupId}
                            onChange={
                                handleLookupChange
                            }
                            onBlur={
                                handleLookupBlur
                            }
                            placeholder="Enter center ID"
                            aria-invalid={Boolean(
                                validationError
                            )}
                            aria-describedby={
                                validationError
                                    ? "lookup-center-id-error"
                                    : undefined
                            }
                        />

                        {validationError && (
                            <p
                                id="lookup-center-id-error"
                                className="mt-1 text-sm text-red-600"
                                role="alert"
                            >
                                {validationError}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loadingCenter}
                    >
                        {loadingCenter
                            ? "Loading..."
                            : "Load Center"}
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
                    <WorkstationCenterDetails
                        center={viewedCenter}
                    />

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-slate-900">
                            Assign Employees
                        </h2>

                        <AssignEmployeesPanel
                            centerId={
                                viewedCenter.centerId
                            }
                            existingEmployees={
                                viewedCenter.employees ||
                                []
                            }
                            onAssigned={() =>
                                loadCenter(
                                    viewedCenter.centerId
                                )
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminWorkstationCenters;