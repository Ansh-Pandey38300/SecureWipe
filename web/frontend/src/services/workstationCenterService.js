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