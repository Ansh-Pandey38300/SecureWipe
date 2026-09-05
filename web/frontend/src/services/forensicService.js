import { apiRequest } from "./api";

export const getForensicDashboard = async () => {
    const response = await apiRequest("/api/forensics/dashboard", { method: "GET" });
    return response.data || {};
};

export const getForensicCases = async () => {
    const response = await apiRequest("/api/forensics", { method: "GET" });
    return response.data || [];
};

export const getForensicCase = async (caseId) => {
    const response = await apiRequest(`/api/forensics/${caseId}`, { method: "GET" });
    return response.data;
};

export const createForensicCase = async (data) => {
    const response = await apiRequest("/api/forensics", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response.data;
};

export const assignForensicCase = async (caseId, employeeId, workstationId = "") => {
    const response = await apiRequest(`/api/forensics/${caseId}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ employeeId, workstationId }),
    });
    return response.data;
};

export const updateForensicStatus = async (caseId, status, note = "") => {
    const response = await apiRequest(`/api/forensics/${caseId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
    });
    return response.data;
};

export const submitForensicResults = async (caseId, payload) => {
    const response = await apiRequest(`/api/forensics/${caseId}/results`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return response.data;
};

export const generateForensicReport = async (caseId) => {
    const response = await apiRequest(`/api/forensics/${caseId}/report`, {
        method: "POST",
    });
    return response.data;
};