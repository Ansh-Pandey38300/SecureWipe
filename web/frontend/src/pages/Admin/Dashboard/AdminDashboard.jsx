import { useEffect, useState } from "react";
import { getAllUsers, } from "../../../services/userService";
import Loading from "../../../components/common/Loading";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StatCard from "../../../components/cards/StatCard";
import PageHeader from "../../../components/ui/PageHeader";
import { getAllSanitizationRequests, } from "../../../services/sanitizationRequestService";


function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sanitizationRequests, setSanitizationRequests] = useState([]);
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [
                    usersResponse,
                    requestsResponse,
                ] = await Promise.all([
                    getAllUsers(),
                    getAllSanitizationRequests(),
                ]);

                const userList =
                    Array.isArray(usersResponse)
                        ? usersResponse
                        : usersResponse.users ||
                        usersResponse.data ||
                        [];

                setUsers(userList);

                setSanitizationRequests(
                    requestsResponse
                );

            } catch (error) {
                setError(
                    error.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <Loading message="Loading dashboard..." />
        );
    }

    if (error) {
        return (
            <ErrorMessage message={error} />
        );
    }

    const totalUsers = users.length;

    const activeUsers = users.filter(
        (user) =>
            user.status === "ACTIVE"
    ).length;

    const workstationHeads =
        users.filter(
            (user) =>
                user.role ===
                "WORKSTATION_HEAD"
        ).length;

    const workstationEmployees =
        users.filter(
            (user) =>
                user.role ===
                "WORKSTATION_EMPLOYEE"
        ).length;

    const customers =
        users.filter(
            (user) =>
                user.role === "CUSTOMER"
        ).length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Admin Dashboard"
                description="Overview based on current backend user data."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={totalUsers}
                />

                <StatCard
                    title="Active Users"
                    value={activeUsers}
                />

                <StatCard
                    title="Workstation Heads"
                    value={workstationHeads}
                />

                <StatCard
                    title="Customers"
                    value={customers}
                />
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">
                    User Overview
                </h2>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                        Workstation Employees:{" "}
                        <span className="font-medium text-slate-900">
                            {workstationEmployees}
                        </span>
                    </p>

                    <p>
                        Data shown above is calculated from the
                        backend users endpoint.
                    </p>
                </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Sanitization Requests
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Requests submitted by customers.
                        </p>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        {sanitizationRequests.length} Total
                    </span>
                </div>

                {sanitizationRequests.length === 0 ? (
                    <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-center">
                        <p className="text-sm text-slate-500">
                            No sanitization requests yet.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-3 py-3">
                                        Request ID
                                    </th>

                                    <th className="px-3 py-3">
                                        Customer
                                    </th>

                                    <th className="px-3 py-3">
                                        Workstation Centre
                                    </th>

                                    <th className="px-3 py-3">
                                        Centre Head
                                    </th>

                                    <th className="px-3 py-3">
                                        Device
                                    </th>

                                    <th className="px-3 py-3">
                                        Capacity
                                    </th>

                                    <th className="px-3 py-3">
                                        Method
                                    </th>

                                    <th className="px-3 py-3">
                                        Date
                                    </th>

                                    <th className="px-3 py-3">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {sanitizationRequests.map(
                                    (request) => (
                                        <tr
                                            key={
                                                request._id ||
                                                request.requestId
                                            }
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-3 py-4 font-medium text-slate-900">
                                                {
                                                    request.requestId
                                                }
                                            </td>

                                            <td className="px-3 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {
                                                            request.customer?.name ||
                                                            request.name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {
                                                            request.customer?.email ||
                                                            request.email
                                                        }
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {
                                                            request.workstationCenter?.name ||
                                                            "N/A"
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        Centre ID:{" "}
                                                        {
                                                            request.workstationCenter?.centerId ||
                                                            "N/A"
                                                        }
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {
                                                            request.workstationCenter?.head?.name ||
                                                            "Not assigned"
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {
                                                            request.workstationCenter?.head?.email ||
                                                            ""
                                                        }
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-3 py-4 text-slate-700">
                                                {
                                                    request.deviceType
                                                }
                                            </td>

                                            <td className="px-3 py-4 text-slate-700">
                                                {
                                                    request.capacity
                                                }
                                            </td>

                                            <td className="px-3 py-4 text-slate-700">
                                                {
                                                    request.sanitizationMethod
                                                }
                                            </td>

                                            <td className="px-3 py-4 text-slate-700">
                                                {request.preferredDate
                                                    ? new Date(
                                                        request.preferredDate
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>

                                            <td className="px-3 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${request.status ===
                                                        "PENDING"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : request.status ===
                                                            "APPROVED"
                                                            ? "bg-blue-50 text-blue-700"
                                                            : request.status ===
                                                                "COMPLETED"
                                                                ? "bg-green-50 text-green-700"
                                                                : request.status ===
                                                                    "REJECTED"
                                                                    ? "bg-red-50 text-red-700"
                                                                    : "bg-slate-100 text-slate-700"
                                                        }`}
                                                >
                                                    {
                                                        request.status
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

    );
}

export default AdminDashboard;