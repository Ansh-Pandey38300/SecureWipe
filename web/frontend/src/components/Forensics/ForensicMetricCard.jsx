function ForensicMetricCard({ title, value, subtitle, icon, tone = "indigo" }) {
    const tones = {
        indigo: "bg-indigo-50 text-indigo-600",
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value ?? 0}</p>
                    {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
                </div>

                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.indigo}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default ForensicMetricCard;