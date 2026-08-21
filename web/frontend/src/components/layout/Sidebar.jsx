import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
    const { user, logout } = useAuth();

    const adminLinks = [
        {
            label: "Dashboard",
            path: "/admin/dashboard",
        },
        {
            label: "Users",
            path: "/admin/users",
        },
        {
            label: "Workstation Centers",
            path: "/admin/workstation-centers",
        },
    ];

    const workstationHeadLinks = [
        {
            label: "Dashboard",
            path: "/workstation/dashboard",
        },
        {
            label: "My Center",
            path: "/workstation/my-center",
        },
        {
            label: "Employees",
            path: "/workstation/employees",
        },
    ];

    const getLinks = () => {
        switch (user?.role) {
            case "ADMIN":
                return adminLinks;

            case "WORKSTATION_HEAD":
                return workstationHeadLinks;

            default:
                return [];
        }
    };

    const links = getLinks();

    return (
        <aside className="w-64 min-h-screen border-r bg-white p-4">
            <div className="mb-8">
                <h1 className="text-xl font-semibold">
                    SecureWipe
                </h1>
            </div>

            <nav className="space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `block rounded-lg px-4 py-2 text-sm ${
                                isActive
                                    ? "bg-gray-100 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-8">
                <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-lg border px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;