import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import {
    assignForensicCase,
    generateForensicReport,
    getForensicCase,
    updateForensicStatus,
} from "../../services/forensicService";
import { getWorkstationCenter } from "../../services/workstationCenterService";

import ForensicStatusBadge from "../../components/Forensics/ForensicStatusBadge";
import ForensicEvidenceDrawer from "../../components/Forensics/ForensicEvidenceDrawer";
import ForensicModal from "../../components/Forensics/ForensicModal";

function ForensicCaseDetails() {
    const { caseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [center, setCenter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedArtifact, setSelectedArtifact] = useState(null);
    const [assignOpen, setAssignOpen] = useState(false);
    const [employeeId, setEmployeeId] = useState("");
    const [workstationId, setWorkstationId] = useState("");

    useEffect(() => {
        loadCase();
    }, [caseId]);

    const loadCase = async () => {
        try {
            setLoading(true);
            const result = await getForensicCase(caseId);
            setItem(result);

            if (result?.workstationCenter?.centerId && ["ADMIN", "WORKSTATION_HEAD"].includes(user?.role)) {
                try {
                    const response = await getWorkstationCenter(result.workstationCenter.centerId);
                    setCenter(response.data || null);
                } catch {
                    setCenter(null);
                }
            }
        } catch (error) {
            toast.error(error.message || "Unable to load forensic case");
            navigate("/forensics/cases");
        } finally {
            setLoading(false);
        }
    };

    const changeStatus = async (status, note = "") => {
        try {
            setActionLoading(true);
            const result = await updateForensicStatus(caseId, status, note);
            setItem(result);
            toast.success(`Case moved to ${status.toLowerCase()}`);
        } catch (error) {
            toast.error(error.message || "Unable to update case");
        } finally {
            setActionLoading(false);
        }
    };

    const assignCase = async () => {
        if (!employeeId) {
            toast.error("Select an employee");
            return;
        }

        try {
            setActionLoading(true);
            const result = await assignForensicCase(caseId, employeeId, workstationId);
            setItem(result);
            setAssignOpen(false);
            toast.success("Forensic case assigned successfully");
        } catch (error) {
            toast.error(error.message || "Unable to assign case");
        } finally {
            setActionLoading(false);
        }
    };

    const generateReport = async () => {
        try {
            setActionLoading(true);
            const result = await generateForensicReport(caseId);

            setItem((previous) => ({
                ...previous,
                report: {
                    generated: true,
                    generatedAt: new Date().toISOString(),
                    reportHash: result.reportHash,
                },
            }));

            toast.success("Forensic report generated");
        } catch (error) {
            toast.error(error.message || "Unable to generate report");
        } finally {
            setActionLoading(false);
        }
    };

    const artifacts = item?.artifacts || [];

    const validationRate = useMemo(() => {
        if (!item?.recoveredArtifacts) return 0;
        return Math.round((Number(item.validatedArtifacts || 0) / Number(item.recoveredArtifacts)) * 100);
    }, [item]);

    if (loading) {
        return <div className="p-8 text-center text-sm text-slate-500">Loading forensic case...</div>;
    }

    if (!item) return null;

    const canAssign = ["ADMIN", "WORKSTATION_HEAD"].includes(user?.role) && ["PENDING", "ASSIGNED"].includes(item.status);
    const canOperate = ["ADMIN", "WORKSTATION_HEAD", "WORKSTATION_EMPLOYEE"].includes(user?.role);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link to="/forensics/cases" className="text-sm font-medium text-slate-500 hover:text-indigo-600">← Cases</Link>
                        <span className="text-slate-300">/</span>
                        <span className="font-mono text-xs font-semibold text-indigo-600">{item.caseId}</span>
                        <ForensicStatusBadge status={item.status} />
                    </div>

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">{item.title}</h1>
                    <p className="mt-1 max-w-3xl text-sm text-slate-500">{item.description || "No case description provided."}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {canAssign && (
                        <button type="button" onClick={() => setAssignOpen(true)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Assign
                        </button>
                    )}

                    {canOperate && item.status === "ASSIGNED" && (
                        <button type="button" disabled={actionLoading} onClick={() => changeStatus("ACQUIRING")} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                            Start acquisition
                        </button>
                    )}

                    {canOperate && item.status === "ACQUIRING" && (
                        <button type="button" disabled={actionLoading} onClick={() => changeStatus("ANALYZING")} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                            Begin analysis
                        </button>
                    )}

                    {item.status === "COMPLETED" && (
                        <button type="button" disabled={actionLoading} onClick={generateReport} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                            {item.report?.generated ? "Regenerate report" : "Generate report"}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric title="Recovered artifacts" value={item.recoveredArtifacts} />
                <Metric title="Validated artifacts" value={item.validatedArtifacts} />
                <Metric title="High confidence" value={item.highConfidenceArtifacts} />
                <Metric title="Validation rate" value={`${validationRate}%`} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <Header title="Source information" description="Original source recorded for this investigation." />

                        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                            <Meta label="Source type" value={item.sourceType === "PHYSICAL_DEVICE" ? "Physical device" : "Forensic image"} />
                            <Meta label="Source name" value={item.sourceName} />
                            <Meta label="Identifier" value={item.sourceIdentifier || "Not provided"} mono />
                            <Meta label="Device type" value={item.deviceType || "Not specified"} />
                            <Meta label="Capacity" value={item.capacity || "Not specified"} />
                            <Meta label="Asset identifier" value={item.assetIdentifier || "Not specified"} />
                        </div>

                        <div className="border-t border-slate-200 bg-green-50 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">✓</div>
                                <div>
                                    <p className="text-sm font-semibold text-green-900">Read-only acquisition mode</p>
                                    <p className="text-xs text-green-700">Source modification is not part of the forensic workflow.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <Header title="Acquisition summary" description="Scan-level evidence collected by the forensic engine." />

                        <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4">
                            <Summary label="Bytes scanned" value={formatBytes(item.bytesScanned)} />
                            <Summary label="Total bytes" value={formatBytes(item.totalBytes)} />
                            <Summary label="Candidates" value={item.candidatesFound || 0} />
                            <Summary label="Recovered bytes" value={formatBytes(item.recoveredBytes)} />
                        </div>

                        <div className="border-t border-slate-200 p-5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-600">Processing progress</span>
                                <span className="font-semibold text-slate-900">{item.progress || 0}%</span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, item.progress || 0))}%` }} />
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <Header title="Evidence artifacts" description={`${artifacts.length} recovered artifact(s) associated with this case.`} />

                        {artifacts.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">No artifacts have been submitted yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <Th>Artifact</Th>
                                            <Th>Type</Th>
                                            <Th>Size</Th>
                                            <Th>Validation</Th>
                                            <Th>Confidence</Th>
                                            <Th />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {artifacts.map((artifact) => (
                                            <tr key={artifact._id || artifact.artifactId} className="hover:bg-slate-50">
                                                <td className="px-4 py-4">
                                                    <p className="font-mono text-xs font-semibold text-indigo-600">{artifact.artifactId}</p>
                                                    <p className="mt-1 max-w-[220px] truncate text-sm font-medium text-slate-900">{artifact.fileName || "Recovered artifact"}</p>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-slate-600">{artifact.fileType}</td>
                                                <td className="px-4 py-4 text-sm text-slate-600">{formatBytes(artifact.size)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${artifact.validated ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                                        {artifact.validated ? "Validated" : "Not validated"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-semibold text-slate-900">{artifact.confidenceScore || 0}%</span>
                                                    <span className="ml-1 text-xs text-slate-500">{artifact.confidenceLevel}</span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button type="button" onClick={() => setSelectedArtifact(artifact)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Inspect</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <Header title="Case assignment" description="Current operational ownership." />
                        <div className="space-y-4 p-5">
                            <Meta label="Customer" value={item.customer?.name || "—"} />
                            <Meta label="Workstation center" value={item.workstationCenter?.name || item.workstationCenter?.centerId || "—"} />
                            <Meta label="Assigned employee" value={item.assignedEmployee?.name || "Not assigned"} />
                            <Meta label="Assigned workstation" value={item.assignedWorkstation?.name || item.assignedWorkstation?.workstationId || "Not assigned"} />
                        </div>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <Header title="Case timeline" description="Status changes recorded by the platform." />
                        <div className="p-5">
                            <div className="space-y-5">
                                {(item.history || []).map((entry, index) => (
                                    <div key={`${entry.changedAt}-${index}`} className="relative flex gap-3">
                                        {index < item.history.length - 1 && <span className="absolute left-1.5 top-4 h-full w-px bg-slate-200" />}
                                        <span className="relative mt-1.5 h-3 w-3 shrink-0 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-semibold text-slate-900">{entry.status}</span>
                                                <span className="text-xs text-slate-400">{formatDateTime(entry.changedAt)}</span>
                                            </div>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">{entry.note || "Status updated"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {item.report?.generated && (
                        <section className="rounded-lg border border-green-200 bg-green-50 p-5">
                            <p className="text-sm font-semibold text-green-900">Report integrity record</p>
                            <p className="mt-2 break-all font-mono text-[10px] leading-5 text-green-700">{item.report.reportHash}</p>
                            <p className="mt-2 text-xs text-green-700">Generated {formatDateTime(item.report.generatedAt)}</p>
                        </section>
                    )}
                </div>
            </div>

            <ForensicEvidenceDrawer artifact={selectedArtifact} onClose={() => setSelectedArtifact(null)} />

            <ForensicModal
                open={assignOpen}
                title="Assign forensic case"
                description="Assign this case to an active employee belonging to the selected workstation center."
                onClose={() => setAssignOpen(false)}
            >
                <div className="space-y-5">
                    {center ? (
                        <>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Employee</label>
                                <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                                    <option value="">Select employee</option>
                                    {(center.employees || []).filter((employee) => employee.status === "ACTIVE").map((employee) => (
                                        <option key={employee._id} value={employee._id}>{employee.name} — {employee.email}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Workstation <span className="font-normal text-slate-400">(optional)</span></label>
                                <select value={workstationId} onChange={(event) => setWorkstationId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                                    <option value="">No workstation selected</option>
                                    {(center.workstations || []).filter((workstation) => workstation.status === "ACTIVE").map((workstation) => (
                                        <option key={workstation._id} value={workstation._id}>{workstation.name || workstation.workstationId}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setAssignOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="button" disabled={actionLoading} onClick={assignCase} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                                    {actionLoading ? "Assigning..." : "Assign case"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500">Unable to load the workstation center assignment data.</p>
                    )}
                </div>
            </ForensicModal>
        </div>
    );
}

function Header({ title, description }) {
    return (
        <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
    );
}

function Metric({ title, value }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value ?? 0}</p>
        </div>
    );
}

function Meta({ label, value, mono = false }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-400">{label}</p>
            <p className={`mt-1 text-sm text-slate-700 ${mono ? "break-all font-mono text-xs" : ""}`}>{value || "—"}</p>
        </div>
    );
}

function Summary({ label, value }) {
    return (
        <div className="bg-white p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
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

function formatDateTime(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default ForensicCaseDetails;