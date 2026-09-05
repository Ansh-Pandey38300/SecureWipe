const crypto = require("crypto");
const ForensicCase = require("../models/ForensicCase");
const WorkstationCenter = require("../models/WorkstationCenter");
const Workstation = require("../models/WorkStation");
const User = require("../models/User");
const Counter = require("../models/Counter");
const AppError = require("../utils/AppError");

const generateCaseId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { name: "forensicCase" },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
    );
    return `FR-${String(counter.sequence).padStart(4, "0")}`;
};

const populateCase = query => query
    .populate("customer", "name email role")
    .populate("workstationCenter", "centerId name location status")
    .populate("assignedEmployee", "name email role")
    .populate("assignedWorkstation", "workstationId name status connectionStatus hostname");

const ensureCaseAccess = (item, user) => {
    if (!item) throw new AppError("Forensic case not found", 404);

    const id = String(user._id);

    if (user.role === "ADMIN") return;
    if (user.role === "CUSTOMER" && String(item.customer?._id || item.customer) === id) return;
    if (user.role === "WORKSTATION_EMPLOYEE" && String(item.assignedEmployee?._id || item.assignedEmployee) === id) return;
    if (user.role === "WORKSTATION_HEAD" && String(item.workstationCenter?._id || item.workstationCenter) === String(user.workstationCenter)) return;

    throw new AppError("Access denied", 403);
};

const addHistory = (item, status, user, note) => {
    item.status = status;
    item.history.push({ status, changedBy: user._id, changedAt: new Date(), note: note || "" });
};

const createForensicCase = async (data, user) => {
    if (user.role !== "CUSTOMER") {
        throw new AppError("Only customers can create forensic cases", 403);
    }

    if (data.sourceType === "PHYSICAL_DEVICE" && !data.sourceIdentifier) {
        throw new AppError("Physical device identifier is required", 400);
    }

    const center = await WorkstationCenter.findOne({
        centerId: data.workstationCenter,
        status: "ACTIVE"
    });

    if (!center) {
        throw new AppError("Selected workstation center is not active or does not exist", 400);
    }

    const caseId = await generateCaseId();

    return ForensicCase.create({
        caseId,
        customer: user._id,
        title: data.title,
        description: data.description || "",
        sourceType: data.sourceType,
        sourceName: data.sourceName,
        sourceIdentifier: data.sourceIdentifier || "",
        deviceType: data.deviceType || "",
        capacity: data.capacity || "",
        assetIdentifier: data.assetIdentifier || "",
        workstationCenter: center._id,
        readOnly: true,
        status: "PENDING",
        history: [{ status: "PENDING", changedBy: user._id, note: "Forensic case created" }]
    });
};

const getCasesForUser = async user => {
    const filter = {};

    if (user.role === "CUSTOMER") filter.customer = user._id;
    if (user.role === "WORKSTATION_EMPLOYEE") filter.assignedEmployee = user._id;
    if (user.role === "WORKSTATION_HEAD") filter.workstationCenter = user.workstationCenter;

    return populateCase(ForensicCase.find(filter).sort({ createdAt: -1 }));
};

const getCaseById = async (caseId, user) => {
    const item = await populateCase(ForensicCase.findOne({ caseId }));
    ensureCaseAccess(item, user);
    return item;
};

const getDashboard = async user => {
    const filter = {};

    if (user.role === "CUSTOMER") filter.customer = user._id;
    if (user.role === "WORKSTATION_EMPLOYEE") filter.assignedEmployee = user._id;
    if (user.role === "WORKSTATION_HEAD") filter.workstationCenter = user.workstationCenter;

    const [cases, aggregate] = await Promise.all([
        populateCase(ForensicCase.find(filter).sort({ updatedAt: -1 }).limit(8)),
        ForensicCase.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalCases: { $sum: 1 },
                    activeCases: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["PENDING", "ASSIGNED", "ACQUIRING", "ANALYZING"]] },
                                1,
                                0
                            ]
                        }
                    },
                    completedCases: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0]
                        }
                    },
                    failedCases: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0]
                        }
                    },
                    artifacts: { $sum: "$recoveredArtifacts" },
                    validatedArtifacts: { $sum: "$validatedArtifacts" },
                    highConfidenceArtifacts: { $sum: "$highConfidenceArtifacts" },
                    recoveredBytes: { $sum: "$recoveredBytes" }
                }
            }
        ])
    ]);

    return {
        stats: aggregate[0] || {
            totalCases: 0,
            activeCases: 0,
            completedCases: 0,
            failedCases: 0,
            artifacts: 0,
            validatedArtifacts: 0,
            highConfidenceArtifacts: 0,
            recoveredBytes: 0
        },
        recentCases: cases
    };
};

const assignCase = async (caseId, data, user) => {
    if (!["WORKSTATION_HEAD", "ADMIN"].includes(user.role)) {
        throw new AppError("Only a workstation head or admin can assign forensic cases", 403);
    }

    const item = await ForensicCase.findOne({ caseId });

    if (!item) throw new AppError("Forensic case not found", 404);

    if (user.role === "WORKSTATION_HEAD" && String(item.workstationCenter) !== String(user.workstationCenter)) {
        throw new AppError("Case does not belong to your workstation center", 403);
    }

    const centerId = item.workstationCenter || user.workstationCenter;

    if (!centerId) {
        throw new AppError("A workstation center is required before assignment", 400);
    }

    if (!item.workstationCenter) item.workstationCenter = centerId;

    const employee = await User.findOne({
        _id: data.employeeId,
        role: "WORKSTATION_EMPLOYEE",
        status: "ACTIVE",
        workstationCenter: centerId
    });

    if (!employee) {
        throw new AppError("Eligible workstation employee not found", 404);
    }

    if (data.workstationId) {
        const ws = await Workstation.findOne({
            _id: data.workstationId,
            workstationCenter: centerId,
            assignedEmployee: employee._id
        });

        if (!ws) {
            throw new AppError("Selected workstation is not assigned to this employee", 400);
        }

        item.assignedWorkstation = ws._id;
    }

    item.assignedEmployee = employee._id;
    addHistory(item, "ASSIGNED", user, `Assigned to ${employee.name}`);

    await item.save();

    return populateCase(ForensicCase.findOne({ caseId }));
};

const updateCaseStatus = async (caseId, status, note, user) => {
    const allowed = ["ACQUIRING", "ANALYZING", "COMPLETED", "FAILED", "CANCELLED"];

    if (!allowed.includes(status)) {
        throw new AppError("Invalid forensic case status", 400);
    }

    const item = await ForensicCase.findOne({ caseId });

    ensureCaseAccess(item, user);

    if (!["WORKSTATION_EMPLOYEE", "ADMIN", "WORKSTATION_HEAD"].includes(user.role)) {
        throw new AppError("You cannot update this forensic case", 403);
    }

    if (user.role === "WORKSTATION_EMPLOYEE" && String(item.assignedEmployee) !== String(user._id)) {
        throw new AppError("Case is not assigned to you", 403);
    }

    if (status === "ACQUIRING" && !item.startedAt) item.startedAt = new Date();

    if (status === "COMPLETED") {
        item.completedAt = new Date();
        item.progress = 100;
    }

    if (status === "FAILED") {
        item.failedAt = new Date();
        item.failureReason = note || item.failureReason;
    }

    addHistory(item, status, user, note || "Status updated");

    await item.save();

    return populateCase(ForensicCase.findOne({ caseId }));
};

const ingestResult = async (caseId, payload, user) => {
    const item = await ForensicCase.findOne({ caseId });

    ensureCaseAccess(item, user);

    if (!["WORKSTATION_EMPLOYEE", "ADMIN"].includes(user.role)) {
        throw new AppError("Only the assigned workstation employee or admin can submit forensic results", 403);
    }

    if (user.role === "WORKSTATION_EMPLOYEE" && String(item.assignedEmployee) !== String(user._id)) {
        throw new AppError("Case is not assigned to you", 403);
    }

    if (!Array.isArray(payload.artifacts)) {
        throw new AppError("Artifacts must be an array", 400);
    }

    item.bytesScanned = Number(payload.bytesScanned) || 0;
    item.totalBytes = Number(payload.totalBytes) || item.totalBytes || 0;
    item.candidatesFound = Number(payload.candidatesFound) || 0;
    item.recoveredArtifacts = Number(payload.recoveredArtifacts) || payload.artifacts.length;
    item.validatedArtifacts = Number(payload.validatedArtifacts) || payload.artifacts.filter(a => a.validated).length;
    item.rejectedArtifacts = Number(payload.rejectedArtifacts) || 0;
    item.highConfidenceArtifacts = Number(payload.highConfidenceArtifacts) || payload.artifacts.filter(a => a.confidenceLevel === "HIGH").length;
    item.recoveredBytes = Number(payload.recoveredBytes) || payload.artifacts.reduce((sum, a) => sum + (Number(a.size) || 0), 0);
    item.progress = 100;

    item.artifacts = payload.artifacts.map((a, index) => ({
        artifactId: String(a.artifactId || `ART-${String(index + 1).padStart(4, "0")}`),
        fileName: String(a.fileName || ""),
        fileType: String(a.fileType || "JPEG"),
        offset: Number(a.offset) || 0,
        size: Number(a.size) || 0,
        recoveredPath: String(a.recoveredPath || ""),
        headerValid: Boolean(a.headerValid),
        footerValid: Boolean(a.footerValid),
        structureValid: Boolean(a.structureValid),
        sizeValid: Boolean(a.sizeValid),
        decodable: Boolean(a.decodable),
        confidenceScore: Math.max(0, Math.min(100, Number(a.confidenceScore) || 0)),
        confidenceLevel: ["HIGH", "MEDIUM", "LOW", "REJECTED"].includes(a.confidenceLevel) ? a.confidenceLevel : "LOW",
        confidenceReasons: Array.isArray(a.confidenceReasons) ? a.confidenceReasons.slice(0, 20).map(String) : [],
        sha256: String(a.sha256 || ""),
        recovered: a.recovered !== false,
        validated: Boolean(a.validated)
    }));

    item.status = payload.status === "FAILED" ? "FAILED" : "COMPLETED";

    if (item.status === "COMPLETED") item.completedAt = new Date();

    if (item.status === "FAILED") {
        item.failedAt = new Date();
        item.failureReason = String(payload.failureReason || "Forensic acquisition failed");
    }

    item.history.push({
        status: item.status,
        changedBy: user._id,
        note: item.status === "FAILED" ? item.failureReason : "Forensic results submitted from workstation"
    });

    await item.save();

    return populateCase(ForensicCase.findOne({ caseId }));
};

const generateReport = async (caseId, user) => {
    const item = await ForensicCase.findOne({ caseId });

    ensureCaseAccess(item, user);

    if (item.status !== "COMPLETED") {
        throw new AppError("A forensic report can only be generated after a completed case", 400);
    }

    const reportPayload = {
        caseId: item.caseId,
        source: {
            type: item.sourceType,
            name: item.sourceName,
            identifier: item.sourceIdentifier,
            readOnly: item.readOnly
        },
        summary: {
            bytesScanned: item.bytesScanned,
            totalBytes: item.totalBytes,
            candidatesFound: item.candidatesFound,
            recoveredArtifacts: item.recoveredArtifacts,
            validatedArtifacts: item.validatedArtifacts,
            rejectedArtifacts: item.rejectedArtifacts,
            highConfidenceArtifacts: item.highConfidenceArtifacts,
            recoveredBytes: item.recoveredBytes
        },
        artifacts: item.artifacts.map(a => ({
            artifactId: a.artifactId,
            fileName: a.fileName,
            fileType: a.fileType,
            offset: a.offset,
            size: a.size,
            confidenceScore: a.confidenceScore,
            confidenceLevel: a.confidenceLevel,
            confidenceReasons: a.confidenceReasons,
            sha256: a.sha256,
            validated: a.validated,
            validation: {
                headerValid: a.headerValid,
                footerValid: a.footerValid,
                structureValid: a.structureValid,
                sizeValid: a.sizeValid,
                decodable: a.decodable
            }
        })),
        generatedAt: new Date().toISOString()
    };

    const reportHash = crypto.createHash("sha256").update(JSON.stringify(reportPayload)).digest("hex");

    item.report = {
        generated: true,
        generatedAt: new Date(),
        reportHash
    };

    await item.save();

    return { report: reportPayload, reportHash };
};

module.exports = {
    createForensicCase,
    getCasesForUser,
    getCaseById,
    getDashboard,
    assignCase,
    updateCaseStatus,
    ingestResult,
    generateReport
};