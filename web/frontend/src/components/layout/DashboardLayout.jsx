import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
    const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname.includes("/users")) {
            return "Users";
        }

        if (location.pathname.includes("/workstation-centers")) {
            return "Workstation Centers";
        }

        if (location.pathname.includes("/my-center")) {
            return "My Center";
        }

        if (location.pathname.includes("/employees")) {
            return "Employees";
        }

        return "Dashboard";
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar title={getPageTitle()} />

                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;