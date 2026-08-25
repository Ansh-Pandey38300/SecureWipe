import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getAllUsers } from "../../services/userService";
import { assignEmployeesToCenter } from "../../services/workstationCenterService";

import Loading from "../common/Loading";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";
import Button from "../ui/Button";

function AssignEmployeesPanel({
    centerId,
    existingEmployees = [],
    onAssigned,
}) {
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [listError, setListError] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [validationError, setValidationError] =
        useState("");
    const [submitting, setSubmitting] = useState(false);

    const existingIds = useMemo(() => {
        return new Set(
            existingEmployees.map((employee) =>
                typeof employee === "object"
                    ? employee._id
                    : employee
            )
        );
    }, [existingEmployees]);

    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            setListError("");

            try {
                const response = await getAllUsers();

                setAllUsers(
                    Array.isArray(response)
                        ? response
                        : response.users ||
                          response.data ||
                          []
                );
            } catch (error) {
                if (error.status === 403) {
                    setListError(
                        "The employee list is only available to Admin accounts right now. Ask an admin to assign employees to this center from the Admin > Workstation Centers page."
                    );
                } else if (error.status === 401) {
                    setListError(
                        "Your session has expired. Please log in again."
                    );
                } else {
                    setListError(
                        error.message ||
                            "Unable to load employees."
                    );
                }
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, [centerId]);

    const eligibleEmployees = useMemo(() => {
        return allUsers.filter(
            (user) =>
                user.role ===
                    "WORKSTATION_EMPLOYEE" &&
                user.status === "ACTIVE" &&
                !existingIds.has(user._id)
        );
    }, [allUsers, existingIds]);

    const toggleSelected = (userId) => {
        setSelectedIds((previous) => {
            const nextSelectedIds =
                previous.includes(userId)
                    ? previous.filter(
                          (id) => id !== userId
                      )
                    : [...previous, userId];

            if (nextSelectedIds.length > 0) {
                setValidationError("");
            }

            return nextSelectedIds;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) {
            return;
        }

        if (selectedIds.length === 0) {
            setValidationError(
                "Select at least one employee to assign."
            );
            return;
        }

        setValidationError("");
        setSubmitting(true);

        try {
            await assignEmployeesToCenter(
                centerId,
                selectedIds
            );

            toast.success(
                "Employees assigned successfully"
            );

            setSelectedIds([]);

            if (onAssigned) {
                onAssigned();
            }
        } catch (error) {
            toast.error(
                error.message ||
                    "Unable to assign employees"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingUsers) {
        return (
            <Loading message="Loading eligible employees..." />
        );
    }

    if (listError) {
        return (
            <ErrorMessage message={listError} />
        );
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
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
        >
            <div
                className={`max-h-64 space-y-1 overflow-y-auto rounded-lg border p-3 ${
                    validationError
                        ? "border-red-500"
                        : "border-slate-200"
                }`}
                aria-invalid={Boolean(
                    validationError
                )}
                aria-describedby={
                    validationError
                        ? "assign-employees-error"
                        : undefined
                }
            >
                {eligibleEmployees.map((user) => (
                    <label
                        key={user._id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                    >
                        <span className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(
                                    user._id
                                )}
                                onChange={() =>
                                    toggleSelected(
                                        user._id
                                    )
                                }
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

            {validationError && (
                <p
                    id="assign-employees-error"
                    className="text-sm text-red-600"
                    role="alert"
                >
                    {validationError}
                </p>
            )}

            <Button
                type="submit"
                disabled={submitting}
            >
                {submitting
                    ? "Assigning..."
                    : `Assign Selected (${selectedIds.length})`}
            </Button>
        </form>
    );
}

export default AssignEmployeesPanel;