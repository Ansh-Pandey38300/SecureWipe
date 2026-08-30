import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getEligibleEmployees, assignEmployeesToCenter } from "../../services/workstationCenterService";
import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";
import Button from "../ui/Button";

function AssignEmployeesPanel({
    centerId,
    existingEmployees = [],
    onAssigned,
}) {
    const [eligibleEmployees, setEligibleEmployees] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [listError, setListError] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {

        const loadEmployees = async () => {

            setLoadingUsers(true);
            setListError("");

            try {

                const response =
                    await getEligibleEmployees(centerId);

                setEligibleEmployees(
                    response.data || []
                );

            } catch (error) {

                if (error.status === 401) {

                    setListError(
                        "Your session has expired. Please log in again."
                    );

                } else if (error.status === 403) {

                    setListError(
                        "You are not authorized to view employees for this centre."
                    );

                } else {

                    setListError(
                        error.message ||
                        "Unable to load eligible employees."
                    );
                }

            } finally {

                setLoadingUsers(false);
            }
        };

        if (centerId) {
            loadEmployees();
        }

    }, [centerId]);

    const toggleSelected = (userId) => {
        setSelectedIds((previous) =>
            previous.includes(userId)
                ? previous.filter((id) => id !== userId)
                : [...previous, userId]
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) {
            return;
        }

        if (selectedIds.length === 0) {
            toast.error("Select at least one employee to assign");
            return;
        }

        setSubmitting(true);

        try {
            await assignEmployeesToCenter(centerId, selectedIds);

            toast.success("Employees assigned successfully");

            setSelectedIds([]);

            if (onAssigned) {
                onAssigned();
            }
        } catch (error) {
            toast.error(
                error.message || "Unable to assign employees"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingUsers) {
        return <Loading message="Loading eligible employees..." />;
    }

    if (listError) {
        return <ErrorMessage message={listError} />;
    }

    if (eligibleEmployees.length === 0) {
        return (
            <EmptyState
                title="No eligible employees"
                message="There are no active, unassigned workstation employees available right now."
            />
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3">
                {eligibleEmployees.map((user) => (
                    <label
                        key={user._id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                    >
                        <span className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(user._id)}
                                onChange={() => toggleSelected(user._id)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />

                            <span className="text-slate-800">
                                {user.name}
                            </span>
                        </span>

                        <span className="text-xs text-slate-400">
                            {user.email}
                        </span>
                    </label>
                ))}
            </div>

            <Button type="submit" disabled={submitting}>
                {submitting
                    ? "Assigning..."
                    : `Assign Selected (${selectedIds.length})`}
            </Button>
        </form>
    );
}

export default AssignEmployeesPanel;