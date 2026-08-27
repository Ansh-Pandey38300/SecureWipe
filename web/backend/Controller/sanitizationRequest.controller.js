const asyncHandler =
    require("../utils/asyncHandler");

const {
    createSanitizationRequest,
    getAllSanitizationRequests,
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