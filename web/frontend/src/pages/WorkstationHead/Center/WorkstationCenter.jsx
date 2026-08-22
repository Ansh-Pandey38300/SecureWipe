import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getWorkstationCenter } from "../../../services/workstationCenterService";

import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";
import WorkstationCenterDetails from "../../../components/workstation/WorkstationCenterDetails";
import AssignEmployeesPanel from "../../../components/workstation/AssignEmployeesPanel";

function WorkstationCenter() {
    const { centerId } = useParams();

    const [center, setCenter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCenter = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getWorkstationCenter(centerId);
            setCenter(response.data || response.center || response);
        } catch (error) {
            setError(
                error.message || "Unable to load workstation center."
            );
        } finally {
            setLoading(false);
        }
    }, [centerId]);

    useEffect(() => {
        if (centerId) {
            loadCenter();
        }
    }, [centerId, loadCenter]);

    if (loading) {
        return <Loading message="Loading workstation center..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!center) {
        return (
            <EmptyState
                title="Center not found"
                message="No workstation center data is available."
            />
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={center.name || "Workstation Center"}
                description="Your workstation center details."
            />

            <WorkstationCenterDetails center={center} />

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">
                    Assign Employees
                </h2>

                <AssignEmployeesPanel
                    centerId={center.centerId}
                    existingEmployees={center.employees || []}
                    onAssigned={loadCenter}
                />
            </div>
        </div>
    );
}

export default WorkstationCenter;