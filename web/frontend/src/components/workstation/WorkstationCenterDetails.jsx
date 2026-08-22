import Badge from "../ui/Badge";

function LocationRow({ location }) {
    if (!location) {
        return null;
    }

    const fields = [
        { label: "Address", value: location.address },
        { label: "City", value: location.city },
        { label: "State", value: location.state },
        { label: "Postal Code", value: location.postalCode },
        { label: "Country", value: location.country },
    ].filter((field) => field.value);

    if (fields.length === 0) {
        return null;
    }

    return (
        <div>
            <dt className="text-xs font-medium uppercase text-slate-400">
                Location
            </dt>

            <dd className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 text-sm text-slate-800 sm:grid-cols-2">
                {fields.map((field) => (
                    <span key={field.label}>
                        <span className="text-slate-400">
                            {field.label}:{" "}
                        </span>
                        {field.value}
                    </span>
                ))}
            </dd>
        </div>
    );
}

function WorkstationCenterDetails({ center }) {
    if (!center) {
        return null;
    }

    const head = center.head;
    const employees = center.employees;

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <dl className="space-y-4">
                <div>
                    <dt className="text-xs font-medium uppercase text-slate-400">
                        Name
                    </dt>

                    <dd className="mt-1 text-sm text-slate-800">
                        {center.name || "-"}
                    </dd>
                </div>

                <div>
                    <dt className="text-xs font-medium uppercase text-slate-400">
                        Status
                    </dt>

                    <dd className="mt-1">
                        <Badge
                            variant={
                                center.status === "ACTIVE"
                                    ? "success"
                                    : "default"
                            }
                        >
                            {center.status || "UNKNOWN"}
                        </Badge>
                    </dd>
                </div>

                {center.centerId && (
                    <div>
                        <dt className="text-xs font-medium uppercase text-slate-400">
                            Center ID
                        </dt>

                        <dd className="mt-1 break-all text-sm text-slate-800">
                            {center.centerId}
                        </dd>
                    </div>
                )}

                <LocationRow location={center.location} />

                {head && (
                    <div>
                        <dt className="text-xs font-medium uppercase text-slate-400">
                            Workstation Head
                        </dt>

                        <dd className="mt-1 text-sm text-slate-800">
                            {typeof head === "object"
                                ? head.name || head.email || head._id
                                : head}
                        </dd>
                    </div>
                )}

                {Array.isArray(employees) && (
                    <div>
                        <dt className="text-xs font-medium uppercase text-slate-400">
                            Employees ({employees.length})
                        </dt>

                        {employees.length === 0 ? (
                            <dd className="mt-1 text-sm text-slate-500">
                                No employees assigned yet.
                            </dd>
                        ) : (
                            <dd className="mt-2 space-y-2">
                                {employees.map((employee) => (
                                    <div
                                        key={
                                            typeof employee === "object"
                                                ? employee._id
                                                : employee
                                        }
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                                    >
                                        <span className="text-slate-800">
                                            {typeof employee === "object"
                                                ? employee.name ||
                                                  employee.email ||
                                                  employee._id
                                                : employee}
                                        </span>

                                        {typeof employee === "object" &&
                                            employee.status && (
                                                <Badge
                                                    variant={
                                                        employee.status ===
                                                        "ACTIVE"
                                                            ? "success"
                                                            : "default"
                                                    }
                                                >
                                                    {employee.status}
                                                </Badge>
                                            )}
                                    </div>
                                ))}
                            </dd>
                        )}
                    </div>
                )}
            </dl>
        </div>
    );
}

export default WorkstationCenterDetails;