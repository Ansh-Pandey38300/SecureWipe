import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { generateForensicReport, getForensicCases } from "../../services/forensicService";
import ForensicEmptyState from "../../components/Forensics/ForensicEmptyState";

function ForensicReports() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(null);

    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
        try {
            setLoading(true);
            setCases(await getForensicCases());
        } catch (error) {
            toast.error(error.message || "Unable to load forensic reports");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (caseId) => {
        try {
            setGenerating(caseId);
            const result = await generateForensicReport(caseId);
            toast.success("Forensic report generated");

            setCases((previous) =>
                previous.map((item) =>
                    item.caseId === caseId
                        ? { ...item, report: { ...(item.report || {}), generated: true, generatedAt: new Date().toISOString(), reportHash: result.reportHash } }
                        : item
                )
            );
        } catch (error) {
            toast.error(error.message || "Unable to generate report");
        } finally {
            setGenerating(null);
        }
    };

    const downloadReport = async (item) => {
        try {
            const result = await generateForensicReport(item.caseId);
            const blob = new Blob([JSON.stringify(result.report, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = `${item.caseId}-forensic-report.json`;
            anchor.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(error.message || "Unable to download report");
        }
    };

    const completed = cases.filter((item) => item.status === "COMPLETED");

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Audit & Reporting</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">Forensic Reports</h1>
                <p className="mt-1 text-sm text-slate-500">Generate integrity-preserving structured reports from completed forensic cases.</p>
            </div>

            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-5">
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">✓</div>
                    <div>
                        <p className="text-sm font-semibold text-indigo-900">Report integrity</p>
                        <p className="mt-1 text-sm leading-5 text-indigo-700">
                            Each generated report is serialized and assigned a SHA-256 report hash so the generated report payload can be independently identified.
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-base font-semibold text-slate-900">Completed cases</h2>
                    <p className="mt-1 text-sm text-slate-500">{completed.length} completed case(s) available for reporting.</p>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-sm text-slate-500">Loading reports...</div>
                ) : completed.length === 0 ? (
                    <div className="p-5">
                        <ForensicEmptyState title="No completed cases" description="Reports become available after forensic processing has completed." />
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {completed.map((item) => (
                            <div key={item.caseId} className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-semibold text-indigo-600">{item.caseId}</span>

                                        {item.report?.generated ? (
                                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Report generated</span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Not generated</span>
                                        )}
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {item.recoveredArtifacts || 0} recovered artifacts · {item.validatedArtifacts || 0} validated · {item.highConfidenceArtifacts || 0} high confidence
                                    </p>

                                    {item.report?.reportHash && (
                                        <p className="mt-2 max-w-xl truncate font-mono text-[10px] text-slate-400">
                                            Report hash: {item.report.reportHash}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={generating === item.caseId}
                                        onClick={() => handleGenerate(item.caseId)}
                                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {generating === item.caseId ? "Generating..." : item.report?.generated ? "Regenerate" : "Generate report"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => downloadReport(item)}
                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Export JSON
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForensicReports;