import { apiRequest } from "./api";

export const getAllSanitizationRequests =
    async () => {

        const response =
            await apiRequest(
                "/api/sanitization-requests"
            );

        return response.data || [];
    };