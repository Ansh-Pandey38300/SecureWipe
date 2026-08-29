import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
    getMyWorkstationCenter,
} from "../../../services/workstationCenterService";


function WorkstationHeadWorkstations() {

    const [center, setCenter] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    const loadWorkstations =
        async () => {

            try {

                setLoading(true);

                const response =
                    await getMyWorkstationCenter();

                setCenter(
                    response.data ||
                    response
                );

            } catch (error) {

                console.error(
                    "Failed to load workstations:",
                    error
                );

                toast.error(
                    error.message ||
                    "Unable to load workstations"
                );

            } finally {

                setLoading(false);
            }
        };


    useEffect(() => {
        loadWorkstations();
    }, []);


    if (loading) {

        return (
            <div className="p-6">

                <p className="text-sm text-slate-500">
                    Loading workstations...
                </p>

            </div>
        );
    }


    const workstations =
        center?.workstations || [];


    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div>

                <h1 className="text-2xl font-semibold text-slate-900">
                    Workstations
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Workstations belonging to your centre.
                </p>

                <p className="mt-2 text-sm font-medium text-slate-700">
                    Centre ID:{" "}
                    <span className="font-mono text-slate-900">
                        {center?.centerId || "N/A"}
                    </span>
                </p>

            </div>


            {/* WORKSTATIONS */}

            {workstations.length === 0 ? (

                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">

                    <p className="text-sm text-slate-500">
                        No workstations found for this centre.
                    </p>

                </div>

            ) : (

                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">

                    <table className="min-w-full">

                        <thead className="bg-slate-50">

                            <tr>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Workstation ID
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Name
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Status
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Connection
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                    Employee
                                </th>

                            </tr>

                        </thead>


                        <tbody className="divide-y divide-slate-200">

                            {workstations.map(
                                (workstation) => (

                                    <tr
                                        key={
                                            workstation._id
                                        }
                                    >

                                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                                            {
                                                workstation.workstationId
                                            }
                                        </td>


                                        <td className="px-4 py-4 text-sm text-slate-700">
                                            {
                                                workstation.name
                                            }
                                        </td>


                                        <td className="px-4 py-4">

                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                {
                                                    workstation.status ||
                                                    "N/A"
                                                }
                                            </span>

                                        </td>


                                        <td className="px-4 py-4 text-sm text-slate-700">
                                            {
                                                workstation.connectionStatus ||
                                                "N/A"
                                            }
                                        </td>


                                        <td className="px-4 py-4 text-sm text-slate-700">

                                            {workstation.assignedEmployee ? (

                                                workstation.assignedEmployee.name ||
                                                "Assigned"

                                            ) : (

                                                <span className="text-slate-400">
                                                    Not assigned
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}


export default WorkstationHeadWorkstations;