import { apiRequest } from "./api";

export const createWorkstation = async (
    workstationData,
    workstationCenterId
) => {
    return apiRequest("/api/workstations", {
        method: "POST",
        body: JSON.stringify({
            ...workstationData,
            workstationCenterId,
        }),
    });
};