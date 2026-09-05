import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getForensicDashboard } from "../../services/forensicService";
import { useAuth } from "../../context/AuthContext";

import ForensicMetricCard from "../../components/Forensics/ForensicMetricCard";
import ForensicStatusBadge from "../../components/Forensics/ForensicStatusBadge";
import ForensicEmptyState from "../../components/Forensics/ForensicEmptyState";

function ForensicDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState({ stats: {}, recentCases: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const result = await getForensicDashboard();
            setData(result || { stats: {}, recentCases: [] });
        } catch (error) {
            toast.error(error.message || "Unable to load forensic dashboard");
        } finally {
            setLoading(false);
        }
    };

    const stats = data.stats || {};
    const recentCases = data.recentCases || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">SecureWipe Forensics</p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900">Forensic Evidence Workspace</h1>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Review acquisition cases, recovered artifacts, validation results and forensic integrity records.
                    </p>
                </div>

                <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                    <p className="text-xs font-medium text-indigo-600">Signed in as</p>
                    <p className="mt-0.5 text-sm font-semibold text-indigo-900">{user?.name || "User"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ForensicMetricCard
                    title="Total Cases"
                    value={stats.totalCases}
                    subtitle="All accessible forensic cases"
                    tone="indigo"
                    icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 10h16M4 14h10M4 18h7" /></svg>}
                />

                <ForensicMetricCard
                    title="Active Cases"
                    value={stats.activeCases}
                    subtitle="Pending or currently processing"
                    tone="blue"
                    icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2" /></svg>}
                />

                <ForensicMetricCard
                    title="Validated Evidence"
                    value={stats.validatedArtifacts}
                    subtitle="Artifacts passing validation"
                    tone="green"
                    icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 12 4 4L19 6" /></svg>}
                />

                <ForensicMetricCard
                    title="High Confidence"
                    value={stats.highConfidenceArtifacts}
                    subtitle="Strong deterministic evidence"
                    tone="purple"
                    icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 19 6v5c0 4.5-2.9 8-7 10-4.1-2-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Recent forensic cases</h2>
                            <p className="mt-1 text-sm text-slate-500">Latest activity across your accessible cases.</p>
                        </div>

                        <button type="button" onClick={() => navigate("/forensics/cases")} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            View all →
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-sm text-slate-500">Loading forensic cases...</div>
                    ) : recentCases.length === 0 ? (
                        <div className="p-5">
                            <ForensicEmptyState title="No forensic cases yet" description="Forensic cases will appear here after they are created." />
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentCases.map((item) => (
                                <button
                                    key={item._id || item.caseId}
                                    type="button"
                                    onClick={() => navigate(`/forensics/cases/${item.caseId}`)}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-semibold text-indigo-600">{item.caseId}</span>
                                            <ForensicStatusBadge status={item.status} />
                                        </div>
                                        <p className="mt-1 truncate text-sm font-medium text-slate-900">{item.title}</p>
                                        <p className="mt-1 text-xs text-slate-500">{item.sourceName || "Unknown source"}</p>
                                    </div>

                                    <div className="hidden shrink-0 text-right sm:block">
                                        <p className="text-sm font-semibold text-slate-900">{item.recoveredArtifacts || 0}</p>
                                        <p className="text-xs text-slate-500">artifacts</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Integrity workflow</h2>
                        <p className="mt-1 text-sm text-slate-500">How evidence moves through SecureWipe.</p>
                    </div>

                    <div className="space-y-4 p-5">
                        {[
                            ["01", "Read-only acquisition", "Source is accessed without write operations."],
                            ["02", "Carving", "The native engine searches the source for supported artifacts."],
                            ["03", "Validation", "Recovered candidates are checked for structural validity."],
                            ["04", "Hashing", "SHA-256 fingerprints preserve artifact identity."],
                            ["05", "Confidence", "Deterministic checks produce an explainable score."],
                            ["06", "Report", "Structured evidence is assembled into a forensic report."],
                        ].map(([number, title, description]) => (
                            <div key={number} className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">{number}</div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{title}</p>
                                    <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Evidence statistics</h2>
                        <p className="mt-1 text-sm text-slate-500">Current forensic evidence volume.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <MiniStat label="Recovered" value={stats.artifacts} />
                        <MiniStat label="Validated" value={stats.validatedArtifacts} />
                        <MiniStat label="High confidence" value={stats.highConfidenceArtifacts} />
                        <MiniStat label="Cases completed" value={stats.completedCases} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-center">
            <p className="text-lg font-semibold text-slate-900">{value ?? 0}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{label}</p>
        </div>
    );
}

export default ForensicDashboard;