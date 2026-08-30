import { apiRequest } from "./api";

export const createWorkstationCenter = async (centerData) => {
    return apiRequest("/api/workstation-centers", {
        method: "POST",
        body: JSON.stringify(centerData),
    });
};

export const getWorkstationCenter = async (centerId) => {
    return apiRequest(`/api/workstation-centers/${centerId}`, {
        method: "GET",
    });
};

export const assignEmployeesToCenter = async (centerId, employeesIds) => {
    return apiRequest(`/api/workstation-centers/${centerId}/employees`, {
        method: "POST",
        body: JSON.stringify({ employeesIds }),
    });
};

export const getActiveWorkstationCenters = async () => {
    return apiRequest("/api/workstation-centers", {
        method: "GET",
    });
};

export const getHeadSanitizationRequests = async () => {
    const response = await apiRequest.get("/sanitization-requests/head");

    return response.data;
};

export const updateSanitizationRequestStatus = async (
    requestId,
    data
) => {
    const response = await apiRequest.patch(
        `/sanitization-requests/${requestId}/status`,
        data
    );

    return response.data;
};

export const getMyWorkstationCenter =
    async () => {

        return apiRequest(
            "/api/workstation-centers/my",
            {
                method: "GET",
            }
        );
    };

export const getEligibleEmployees = async (centerId) => {
    return apiRequest(
        `/api/workstation-centers/${centerId}/eligible-employees`,
        {
            method: "GET",
        }
    );
};