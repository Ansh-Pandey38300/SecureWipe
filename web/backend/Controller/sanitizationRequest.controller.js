const asyncHandler =
    require("../utils/asyncHandler");

const {
    createSanitizationRequest,
    getAllSanitizationRequests,
    getMySanitizationRequests,
    getHeadSanitizationRequests,
    getHeadApprovedSanitizationRequests,
    updateSanitizationRequestStatus,
    assignSanitizationRequest,
    getAllHeadSanitizationRequests,
} = require(
    "../services/sanitizationRequest.services"
);


module.exports.createSanitizationRequest =
    asyncHandler(
        async (req, res) => {

            const request =
                await createSanitizationRequest(
                    req.body,
                    req.user
                );

            res.status(201).json({
                success: true,

                message:
                    "Sanitization request submitted successfully",

                data: {
                    requestId:
                        request.requestId,

                    status:
                        request.status,

                    createdAt:
                        request.createdAt,
                },
            });
        }
    );


module.exports.getAllSanitizationRequests =
    asyncHandler(
        async (req, res) => {

            const requests =
                await getAllSanitizationRequests();

            res.status(200).json({
                success: true,

                data: requests,
            });
        }
    );

module.exports.getMySanitizationRequests =
    asyncHandler(
        async (req, res) => {

            const requests =
                await getMySanitizationRequests(
                    req.user
                );

            res.status(200).json({
                success: true,

                data: requests,
            });
        }
    );

module.exports.getHeadSanitizationRequests =
    asyncHandler(
        async (req, res) => {

            const requests =
                await getHeadSanitizationRequests(
                    req.user
                );

            res.status(200).json({
                success: true,

                data: requests,
            });
        }
    );

    module.exports.updateSanitizationRequestStatus =
    asyncHandler(
        async (req, res) => {

            const request =
                await updateSanitizationRequestStatus(
                    req.params.requestId,
                    req.body,
                    req.user
                );

            res.status(200).json({
                success: true,

                message:
                    "Sanitization request status updated successfully",

                data: {
                    requestId:
                        request.requestId,

                    status:
                        request.status,

                    reviewedBy:
                        request.reviewedBy,

                    reviewedAt:
                        request.reviewedAt,

                    rejectionReason:
                        request.rejectionReason,
                },
            });
        }
    );



module.exports.getHeadApprovedSanitizationRequests =
    asyncHandler(
        async (req, res) => {

            const requests =
                await getHeadApprovedSanitizationRequests(
                    req.user
                );

            res.status(200).json({
                success: true,

                data: requests,
            });
        }
    );

module.exports.assignSanitizationRequest =
    asyncHandler(
        async (req, res) => {

            const request =
                await assignSanitizationRequest(
                    req.params.requestId,
                    req.body,
                    req.user
                );

            res.status(200).json({
                success: true,

                message:
                    "Sanitization request assigned successfully",

                data: {
                    requestId:
                        request.requestId,

                    status:
                        request.status,

                    assignedCenter:
                        request.assignedCenter,

                    assignedEmployee:
                        request.assignedEmployee,

                    assignedWorkstation:
                        request.assignedWorkstation,

                    assignedAt:
                        request.assignedAt
                }
            });
        }
    );

module.exports.getAllHeadSanitizationRequests =
    asyncHandler(
        async (req, res) => {

            const requests =
                await getAllHeadSanitizationRequests(
                    req.user
                );

            res.status(200).json({
                success: true,

                data: requests,
            });
        }
    );