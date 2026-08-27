const SanitizationRequest =
    require("../models/SanitizationRequest");

const AppError =
    require("../utils/AppError");

const createSanitizationRequest =
    async (data, user) => {

        if (!user) {
            throw new AppError(
                "Authentication required",
                401
            );
        }

        if (user.role !== "CUSTOMER") {
            throw new AppError(
                "Only customers can create sanitization requests",
                403
            );
        }

        const request =
            await SanitizationRequest.create({
                customer: user._id,

                name: data.name,

                email: data.email,

                phone: data.phone,

                deviceType:
                    data.deviceType,

                capacity:
                    data.capacity,

                deviceCount:
                    data.deviceCount,

                assetIdentifier:
                    data.assetIdentifier || "",

                sanitizationMethod:
                    data.sanitizationMethod,

                additionalRequirements:
                    data.additionalRequirements ||
                    "",

                preferredDate:
                    data.preferredDate || null,

                notes:
                    data.notes || "",

                consent:
                    data.consent,

                status: "PENDING",
            });

        return request;
    };


const getAllSanitizationRequests =
    async () => {

        const requests =
            await SanitizationRequest
                .find()
                .populate(
                    "customer",
                    "name email role"
                )
                .sort({
                    createdAt: -1,
                });

        return requests;
    };


module.exports = {
    createSanitizationRequest,
    getAllSanitizationRequests,
};