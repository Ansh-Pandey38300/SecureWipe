import { useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";

import {
    getEmployeeSanitizationRequests,
} from "../../../services/sanitizationRequestService";


function WorkstationEmployeeDashboard() {

    const { user } = useAuth();

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const loadRequests = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getEmployeeSanitizationRequests();

            setRequests(data);

        } catch (err) {

            console.error(
                "Failed to load employee requests:",
                err
            );

            setError(
                err.message ||
                "Failed to load assigned requests."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadRequests();

    }, []);


    return (
        <div className="space-y-6">

            {/* Page Header */}

            <div>

                <h1 className="text-2xl font-semibold text-slate-900">
                    Workstation Employee Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Welcome, {user?.name}.
                </p>

            </div>


            {/* Loading */}

            {loading && (

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

                    <p className="text-sm text-slate-500">
                        Loading assigned requests...
                    </p>

                </div>

            )}


            {/* Error */}

            {!loading && error && (

                <div className="rounded-lg border border-red-200 bg-red-50 p-6">

                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                </div>

            )}


            {/* No requests */}

            {!loading &&
                !error &&
                requests.length === 0 && (

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

                        <p className="text-sm text-slate-500">
                            No sanitization requests have been assigned to you.
                        </p>

                    </div>

                )
            }


            {/* Assigned Requests */}

            {!loading &&
                !error &&
                requests.length > 0 && (

                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 p-6">

                            <h2 className="text-lg font-semibold text-slate-900">
                                My Assigned Requests
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Sanitization requests assigned to you.
                            </p>

                        </div>


                        <div className="overflow-x-auto">

                            <table className="min-w-full">

                                <thead className="border-b border-slate-200 bg-slate-50">

                                    <tr>

                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Request
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Device
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Method
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Workstation
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-slate-100">

                                    {requests.map(
                                        (request) => (

                                            <tr
                                                key={
                                                    request._id
                                                }
                                                className="hover:bg-slate-50"
                                            >

                                                <td className="px-6 py-4">

                                                    <div className="font-medium text-slate-900">
                                                        {
                                                            request.requestId
                                                        }
                                                    </div>

                                                </td>


                                                <td className="px-6 py-4 text-sm text-slate-700">

                                                    {
                                                        request.deviceType ||
                                                        "N/A"
                                                    }

                                                </td>


                                                <td className="px-6 py-4 text-sm text-slate-700">

                                                    {
                                                        request.sanitizationMethod ||
                                                        "N/A"
                                                    }

                                                </td>


                                                <td className="px-6 py-4 text-sm text-slate-700">

                                                    {
                                                        request
                                                            .assignedWorkstation
                                                            ?.workstationId ||
                                                        "N/A"
                                                    }

                                                </td>


                                                <td className="px-6 py-4">

                                                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">

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

                    </div>

                )
            }

        </div>
    );
}


export default WorkstationEmployeeDashboard;