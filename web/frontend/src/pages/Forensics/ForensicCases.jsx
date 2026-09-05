import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { getForensicCases } from "../../services/forensicService";
import ForensicStatusBadge from "../../components/Forensics/ForensicStatusBadge";
import ForensicEmptyState from "../../components/Forensics/ForensicEmptyState";

function ForensicCases() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
        try {
            setLoading(true);
            setCases(await getForensicCases());
        } catch (error) {
            toast.error(error.message || "Unable to load forensic cases");
        } finally {
            setLoading(false);
        }
    };

    const filteredCases = useMemo(() => {
        const query = search.trim().toLowerCase();

        return cases.filter((item) => {
            const matchesStatus = status === "ALL" || item.status === status;
            const matchesSearch = !query || [
                item.caseId,
                item.title,
                item.sourceName,
                item.sourceIdentifier,
            ].some((value) => String(value || "").toLowerCase().includes(query));

            return matchesStatus && matchesSearch;
        });
    }, [cases, search, status]);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Investigation Management</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">Forensic Cases</h1>
                <p className="mt-1 text-sm text-slate-500">Track acquisition, analysis and evidence lifecycle for every forensic case.</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m16 16 4 4" />
                        </svg>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by case ID, title or source..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                        <option value="ALL">All statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="ACQUIRING">Acquiring</option>
                        <option value="ANALYZING">Analyzing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <button type="button" onClick={loadCases} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        Refresh
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Case registry</h2>
                            <p className="mt-1 text-sm text-slate-500">{filteredCases.length} case(s) visible</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">Loading forensic cases...</div>
                ) : filteredCases.length === 0 ? (
                    <div className="p-5">
                        <ForensicEmptyState title="No matching cases" description="Try changing your search or status filter." />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <Th>Case</Th>
                                    <Th>Source</Th>
                                    <Th>Status</Th>
                                    <Th>Evidence</Th>
                                    <Th>Confidence</Th>
                                    <Th>Created</Th>
                                    <Th />
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredCases.map((item) => (
                                    <tr key={item._id || item.caseId} className="transition hover:bg-slate-50">
                                        <td className="px-4 py-4">
                                            <p className="font-mono text-xs font-semibold text-indigo-600">{item.caseId}</p>
                                            <p className="mt-1 max-w-xs truncate text-sm font-medium text-slate-900">{item.title}</p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="text-sm text-slate-700">{item.sourceName || "—"}</p>
                                            <p className="mt-1 text-xs text-slate-500">{formatSourceType(item.sourceType)}</p>
                                        </td>

                                        <td className="px-4 py-4"><ForensicStatusBadge status={item.status} /></td>

                                        <td className="px-4 py-4 text-sm text-slate-700">{item.recoveredArtifacts || 0}</td>

                                        <td className="px-4 py-4">
                                            <span className="text-sm font-semibold text-slate-900">{item.highConfidenceArtifacts || 0}</span>
                                            <span className="ml-1 text-xs text-slate-500">high</span>
                                        </td>

                                        <td className="px-4 py-4 text-xs text-slate-500">{formatDate(item.createdAt)}</td>

                                        <td className="px-4 py-4 text-right">
                                            <Link to={`/forensics/cases/${item.caseId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                                Open →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function Th({ children }) {
    return <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{children}</th>;
}

function formatSourceType(value) {
    return value === "PHYSICAL_DEVICE" ? "Physical device" : "Forensic image";
}

function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default ForensicCases;