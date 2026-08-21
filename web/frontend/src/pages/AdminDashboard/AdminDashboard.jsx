import React from "react";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Welcome, {user?.name}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage SecureWipe users and workstation centers.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        —
                    </p>
                </div>

                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Active Users</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        —
                    </p>
                </div>

                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Workstation Heads
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        —
                    </p>
                </div>

                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Workstation Centers
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        —
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;