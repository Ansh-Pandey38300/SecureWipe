import React from "react";
import { useAuth } from "../../context/AuthContext";

const Topbar = ({ title = "Dashboard" }) => {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between border-b bg-white px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
                {title}
            </h2>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                        {user?.name || "User"}
                    </p>

                    <p className="text-xs text-gray-500">
                        {user?.role || ""}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Topbar;