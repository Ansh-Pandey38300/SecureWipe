import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
    getAllHeadSanitizationRequests,
} from "../../../services/sanitizationRequestService";


function WorkstationHeadSanitizationRequests() {

    const [requests, setRequests] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [search, setSearch] =
        useState("");


    const loadRequests =
        async () => {

            try {

                setLoading(true);

                const data =
                    await getAllHeadSanitizationRequests();

                setRequests(
                    data || []
                );

            } catch (error) {

                console.error(
                    "Failed to load sanitization requests:",
                    error
                );

                toast.error(
                    error.message ||
                    "Unable to load sanitization requests"
                );

            } finally {

                setLoading(false);
            }
        };


    useEffect(() => {
        loadRequests();
    }, []);


    const filteredRequests =
        useMemo(() => {

            return requests.filter(
                (request) => {

                    const matchesStatus =
                        statusFilter === "ALL" ||
                        request.status ===
                            statusFilter;


                    const searchText =
                        search
                            .trim()
                            .toLowerCase();


                    if (!searchText) {
                        return matchesStatus;
                    }


                    const customerName =
                        request.customer?.name ||
                        request.name ||
                        "";

                    const customerPhone =
                        request.phone ||
                        request.customer?.phone ||
                        "";

                    const requestId =
                        request.requestId ||
                        "";

                    return (
                        matchesStatus &&
                        (
                            customerName
                                .toLowerCase()
                                .includes(searchText) ||

                            customerPhone
                                .toLowerCase()
                                .includes(searchText) ||

                            requestId
                                .toLowerCase()
                                .includes(searchText)
                        )
                    );
                }
            );

        }, [
            requests,
            statusFilter,
            search
        ]);


    if (loading) {

        return (
            <div className="p-6">

                <p className="text-sm text-slate-500">
                    Loading sanitization requests...
                </p>

            </div>
        );
    }


    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div>

                <h1 className="text-2xl font-semibold text-slate-900">
                    Sanitization Requests
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    View and track all sanitization requests assigned to your centre.
                </p>

            </div>


            {/* FILTERS */}

            <div className="flex flex-col gap-3 md:flex-row">

                <input
                    type="text"
                    placeholder="Search customer, mobile or request ID"
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />


                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >

                    <option value="ALL">
                        All Statuses
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="APPROVED">
                        Approved
                    </option>

                    <option value="REJECTED">
                        Rejected
                    </option>

                    <option value="ASSIGNED">
                        Assigned
                    </option>

                    <option value="IN_PROGRESS">
                        In Progress
                    </option>

                    <option value="VERIFYING">
                        Verifying
                    </option>

                    <option value="COMPLETED">
                        Completed
                    </option>

                    <option value="FAILED">
                        Failed
                    </option>

                    <option value="CANCELLED">
                        Cancelled
                    </option>

                </select>

            </div>


            {/* TABLE */}

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">

                <table className="min-w-full text-sm">

                    <thead className="border-b border-slate-200 bg-slate-50">

                        <tr>

                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Request
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Customer
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Device
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Status
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Employee
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                Workstation
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredRequests.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="px-4 py-10 text-center text-sm text-slate-500"
                                >
                                    No sanitization requests found.
                                </td>

                            </tr>

                        ) : (

                            filteredRequests.map(
                                (request) => (

                                    <tr
                                        key={
                                            request.requestId
                                        }
                                        className="border-b border-slate-100 last:border-0"
                                    >

                                        <td className="px-4 py-4">

                                            <p className="font-medium text-slate-900">
                                                {
                                                    request.requestId
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    new Date(
                                                        request.createdAt
                                                    ).toLocaleDateString()
                                                }
                                            </p>

                                        </td>


                                        <td className="px-4 py-4">

                                            <p className="font-medium text-slate-900">
                                                {
                                                    request.name ||
                                                    request.customer?.name ||
                                                    "N/A"
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    request.phone ||
                                                    request.customer?.phone ||
                                                    "N/A"
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    request.email ||
                                                    request.customer?.email ||
                                                    "N/A"
                                                }
                                            </p>

                                        </td>


                                        <td className="px-4 py-4">

                                            <p className="font-medium text-slate-900">
                                                {
                                                    request.deviceType
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    request.capacity
                                                }
                                                {" • "}
                                                {
                                                    request.deviceCount
                                                }{" "}
                                                device(s)
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    request.sanitizationMethod
                                                }
                                            </p>

                                        </td>


                                        <td className="px-4 py-4">

                                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                {
                                                    request.status
                                                }
                                            </span>

                                        </td>


                                        <td className="px-4 py-4">

                                            {request.assignedEmployee ? (

                                                <>
                                                    <p className="font-medium text-slate-900">
                                                        {
                                                            request.assignedEmployee.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {
                                                            request.assignedEmployee.email
                                                        }
                                                    </p>
                                                </>

                                            ) : (

                                                <span className="text-slate-400">
                                                    Not assigned
                                                </span>

                                            )}

                                        </td>


                                        <td className="px-4 py-4">

                                            {request.assignedWorkstation ? (

                                                <>
                                                    <p className="font-medium text-slate-900">
                                                        {
                                                            request.assignedWorkstation.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {
                                                            request.assignedWorkstation.workstationId
                                                        }
                                                    </p>
                                                </>

                                            ) : (

                                                <span className="text-slate-400">
                                                    Not assigned
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>


            <p className="text-xs text-slate-500">
                Showing {filteredRequests.length} of {requests.length} requests.
            </p>

        </div>
    );
}


export default WorkstationHeadSanitizationRequests;