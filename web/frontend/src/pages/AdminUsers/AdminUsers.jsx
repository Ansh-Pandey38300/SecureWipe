import React, { useEffect, useState } from "react";
import {
    getAllUsers,
    updateUserRole,
} from "../../services/authService";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [updatingRole, setUpdatingRole] = useState(false);
    const [roleMessage, setRoleMessage] = useState("");

    const loadUsers = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAllUsers();
            setUsers(data.data || []);
        } catch (error) {
            console.error("Unable to load users:", error);
            setError(error.message || "Unable to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    if (loading) {
        return (
            <div className="rounded-lg border bg-white p-6">
                <p className="text-sm text-gray-500">
                    Loading users...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border bg-white p-6">
                <p className="text-sm text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    const filteredUsers = users.filter((user) => {
        const searchTerm = search.toLowerCase();

        return (
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Users
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage registered users.
                </p>
            </div>

            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="border-b p-4">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name or email"
                        className="w-full max-w-md rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                    />
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="p-6">
                        <p className="text-sm text-gray-500">
                            No users found.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Name
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Email
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Role
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {user.name}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.email}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.status}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                type="button"
                                                disabled={updatingRole}
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setSelectedRole(user.role);
                                                    setRoleMessage("");
                                                }}
                                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Change Role
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Change User Role
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Update the role for {selectedUser.name}.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    User
                                </p>

                                <p className="mt-1 text-sm text-gray-600">
                                    {selectedUser.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Current Role
                                </p>

                                <p className="mt-1 text-sm text-gray-600">
                                    {selectedUser.role}
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="new-role"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    New Role
                                </label>

                                <select
                                    id="new-role"
                                    value={selectedRole}
                                    onChange={(event) =>
                                        setSelectedRole(event.target.value)
                                    }
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                                >
                                    <option value="CUSTOMER">
                                        CUSTOMER
                                    </option>

                                    <option value="WORKSTATION_HEAD">
                                        WORKSTATION_HEAD
                                    </option>

                                    <option value="WORKSTATION_EMPLOYEE">
                                        WORKSTATION_EMPLOYEE
                                    </option>
                                </select>
                            </div>

                            {roleMessage && (
                                <p className="text-sm text-red-600">
                                    {roleMessage}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setSelectedRole("");
                                        setRoleMessage("");
                                    }}
                                    className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        updatingRole ||
                                        !selectedUser ||
                                        selectedRole === selectedUser.role
                                    }
                                    onClick={async () => {
                                        if (!selectedUser) {
                                            return;
                                        }

                                        setUpdatingRole(true);
                                        setRoleMessage("");

                                        try {
                                            const data = await updateUserRole(
                                                selectedUser._id,
                                                selectedRole
                                            );

                                            setUsers((currentUsers) =>
                                                currentUsers.map((user) =>
                                                    user._id === selectedUser._id
                                                        ? {
                                                              ...user,
                                                              ...data.data,
                                                          }
                                                        : user
                                                )
                                            );

                                            setSelectedUser(null);
                                            setSelectedRole("");
                                        } catch (error) {
                                            console.error(
                                                "Unable to update user role:",
                                                error
                                            );

                                            setRoleMessage(
                                                error.message ||
                                                    "Unable to update user role."
                                            );
                                        } finally {
                                            setUpdatingRole(false);
                                        }
                                    }}
                                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updatingRole
                                        ? "Updating..."
                                        : "Update Role"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;