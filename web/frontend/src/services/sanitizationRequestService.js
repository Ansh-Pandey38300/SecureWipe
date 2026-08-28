import { apiRequest } from "./api";

export const getAllSanitizationRequests =
    async () => {

        const response =
            await apiRequest(
                "/api/sanitization-requests"
            );

        return response.data || [];
    };


export const getHeadSanitizationRequests =
    async () => {

        const response =
            await apiRequest(
                "/api/sanitization-requests/head"
            );

        return response.data || [];
    };


export const getHeadApprovedSanitizationRequests =
    async () => {

        const response =
            await apiRequest(
                "/api/sanitization-requests/head/approved"
            );

        return response.data || [];
    };


export const updateSanitizationRequestStatus =
    async (
        requestId,
        data
    ) => {

        const response =
            await apiRequest(
                `/api/sanitization-requests/${requestId}/status`,
                {
                    method: "PATCH",

                    body:
                        JSON.stringify(data),
                }
            );

        return response.data;
    };


export const assignSanitizationRequest =
    async (
        requestId,
        data
    ) => {

        const response =
            await apiRequest(
                `/api/sanitization-requests/${requestId}/assign`,
                {
                    method: "PATCH",

                    body:
                        JSON.stringify(data),
                }
            );

        return response.data;
    };