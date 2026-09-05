import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getForensicCases } from "../../services/forensicService";
import ForensicEvidenceDrawer from "../../components/Forensics/ForensicEvidenceDrawer";
import ForensicEmptyState from "../../components/Forensics/ForensicEmptyState";

function ForensicEvidence() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        loadEvidence();
    }, []);

    const loadEvidence = async () => {
        try {
            setLoading(true);
            setCases(await getForensicCases());
        } catch (error) {
            toast.error(error.message || "Unable to load evidence");
        } finally {
            setLoading(false);
        }
    };

    const evidence = useMemo(() => {
        const query = search.trim().toLowerCase();

        return cases.flatMap((item) =>
            (item.artifacts || []).map((artifact) => ({
                ...artifact,
                caseId: item.caseId,
                caseTitle: item.title,
            }))
        ).filter((artifact) => {
            if (!query) return true;

            return [
                artifact.artifactId,
                artifact.fileName,
                artifact.fileType,
                artifact.sha256,
                artifact.caseId,
            ].some((value) => String(value || "").toLowerCase().includes(query));
        });
    }, [cases, search]);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Evidence Registry</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">Recovered Evidence</h1>
                <p className="mt-1 text-sm text-slate-500">Search recovered artifacts, validation checks and SHA-256 fingerprints.</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative">
                    <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m16 16 4 4" />
                    </svg>
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search artifact, filename, case ID or SHA-256..."
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Evidence registry</h2>
                        <p className="mt-1 text-sm text-slate-500">{evidence.length} artifact(s)</p>
                    </div>

                    <button type="button" onClick={loadEvidence} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">Loading evidence...</div>
                ) : evidence.length === 0 ? (
                    <div className="p-5">
                        <ForensicEmptyState title="No evidence available" description="Recovered artifacts will appear here once a forensic case has results." />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <Th>Artifact</Th>
                                    <Th>Case</Th>
                                    <Th>Type</Th>
                                    <Th>Size</Th>
                                    <Th>Confidence</Th>
                                    <Th>SHA-256</Th>
                                    <Th />
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {evidence.map((artifact) => (
                                    <tr key={`${artifact.caseId}-${artifact.artifactId}`} className="hover:bg-slate-50">
                                        <td className="px-4 py-4">
                                            <p className="font-mono text-xs font-semibold text-indigo-600">{artifact.artifactId}</p>
                                            <p className="mt-1 max-w-xs truncate text-sm font-medium text-slate-900">{artifact.fileName || "Recovered artifact"}</p>
                                        </td>

                                        <td className="px-4 py-4 font-mono text-xs text-slate-600">{artifact.caseId}</td>
                                        <td className="px-4 py-4 text-sm text-slate-700">{artifact.fileType}</td>
                                        <td className="px-4 py-4 text-sm text-slate-700">{formatBytes(artifact.size)}</td>

                                        <td className="px-4 py-4">
                                            <Confidence score={artifact.confidenceScore} level={artifact.confidenceLevel} />
                                        </td>

                                        <td className="max-w-[240px] px-4 py-4 font-mono text-[10px] text-slate-500">
                                            <span className="block truncate">{artifact.sha256 || "Not available"}</span>
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <button type="button" onClick={() => setSelected(artifact)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                                Inspect
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                <div className="flex gap-3">
                    <div className="mt-0.5 text-indigo-600">ⓘ</div>
                    <div>
                        <p className="text-sm font-semibold text-indigo-900">Evidence integrity</p>
                        <p className="mt-1 text-xs leading-5 text-indigo-700">
                            SHA-256 values identify recovered artifacts. Confidence is a deterministic triage signal derived from validation checks; it does not represent an AI probability of truth.
                        </p>
                    </div>
                </div>
            </div>

            <ForensicEvidenceDrawer artifact={selected} onClose={() => setSelected(null)} />
        </div>
    );
}

function Confidence({ score = 0, level = "LOW" }) {
    const styles = {
        HIGH: "text-green-700 bg-green-50",
        MEDIUM: "text-amber-700 bg-amber-50",
        LOW: "text-slate-600 bg-slate-100",
        REJECTED: "text-red-700 bg-red-50",
    };

    return (
        <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${styles[level] || styles.LOW}`}>{level}</span>
            <span className="text-xs font-semibold text-slate-700">{score}%</span>
        </div>
    );
}

function Th({ children }) {
    return <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{children}</th>;
}

function formatBytes(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024) return `${value} B`;
    if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
    if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
    return `${(value / 1024 ** 3).toFixed(2)} GB`;
}

export default ForensicEvidence;