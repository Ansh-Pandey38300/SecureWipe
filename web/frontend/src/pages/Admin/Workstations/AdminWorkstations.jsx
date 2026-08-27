import { useState } from "react";

import { createWorkstation } from "../../../services/workstationService";

import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import PageHeader from "../../../components/ui/PageHeader";
import WorkstationForm from "../../../components/forms/WorkstationForm";

function AdminWorkstations() {
    const [submitting, setSubmitting] = useState(false);
    const [createdWorkstation, setCreatedWorkstation] = useState(null);
    const [error, setError] = useState("");

    const handleCreate = async (workstationData) => {
        setSubmitting(true);
        setError("");

        try {
            const response = await createWorkstation(workstationData);

            const created =
                response.data ||
                response.workstation ||
                response;

            setCreatedWorkstation(created);
        } catch (error) {
            setCreatedWorkstation(null);
            setError(
                error.message ||
                "Unable to create workstation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Workstations"
                description="Register and manage SecureWipe workstations."
            />

            <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">
                    Create Workstation
                </h2>

                <WorkstationForm
                    onSubmit={handleCreate}
                    submitting={submitting}
                />
            </div>

            {submitting && (
                <Loading message="Creating workstation..." />
            )}

            {!submitting && error && (
                <ErrorMessage message={error} />
            )}

            {!submitting && createdWorkstation && (
                <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">
                        Workstation Created
                    </h2>

                    <div className="space-y-2 text-sm text-slate-700">
                        <p>
                            <span className="font-medium">
                                Name:
                            </span>{" "}
                            {createdWorkstation.name}
                        </p>

                        {createdWorkstation.workstationId && (
                            <p>
                                <span className="font-medium">
                                    Workstation ID:
                                </span>{" "}
                                {createdWorkstation.workstationId}
                            </p>
                        )}

                        {createdWorkstation.status && (
                            <p>
                                <span className="font-medium">
                                    Status:
                                </span>{" "}
                                {createdWorkstation.status}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminWorkstations;