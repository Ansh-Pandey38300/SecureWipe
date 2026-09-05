function ForensicStatusBadge({ status = "PENDING" }) {
    const styles = {
        PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
        ASSIGNED: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
        ACQUIRING: "bg-blue-50 text-blue-700 ring-blue-600/20",
        ANALYZING: "bg-purple-50 text-purple-700 ring-purple-600/20",
        COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        FAILED: "bg-red-50 text-red-700 ring-red-600/20",
        CANCELLED: "bg-slate-100 text-slate-600 ring-slate-500/20",
    };

    const labels = {
        PENDING: "Pending",
        ASSIGNED: "Assigned",
        ACQUIRING: "Acquiring",
        ANALYZING: "Analyzing",
        COMPLETED: "Completed",
        FAILED: "Failed",
        CANCELLED: "Cancelled",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] || styles.PENDING}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {labels[status] || status}
        </span>
    );
}

export default ForensicStatusBadge;