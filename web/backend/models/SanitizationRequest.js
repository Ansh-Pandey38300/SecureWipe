const mongoose = require("mongoose");

const sanitizationRequestSchema =
    new mongoose.Schema(
        {
            requestId: {
                type: String,
                unique: true,
                index: true,
            },

            customer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            name: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100,
            },

            email: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
                maxlength: 254,
            },

            phone: {
                type: String,
                required: true,
                trim: true,
                maxlength: 20,
            },

            deviceType: {
                type: String,
                required: true,
                enum: [
                    "SSD",
                    "HDD",
                    "USB Drive",
                    "NVMe SSD",
                    "Other",
                ],
            },

            capacity: {
                type: String,
                required: true,
                enum: [
                    "2 GB",
                    "4 GB",
                    "8 GB",
                    "16 GB",
                    "32 GB",
                    "64 GB",
                    "128 GB",
                    "256 GB",
                    "512 GB",
                    "1 TB",
                    "2 TB",
                    "Other",
                ],
            },

            deviceCount: {
                type: Number,
                required: true,
                min: 1,
                max: 100,
            },

            assetIdentifier: {
                type: String,
                trim: true,
                maxlength: 100,
                default: "",
            },

            sanitizationMethod: {
                type: String,
                required: true,
                enum: [
                    "Secure Erase",
                    "Cryptographic Erase",
                    "Overwrite",
                    "Standard Sanitization",
                    "To Be Determined",
                ],
            },

            additionalRequirements: {
                type: String,
                trim: true,
                maxlength: 1000,
                default: "",
            },

            preferredDate: {
                type: Date,
                default: null,
            },

            notes: {
                type: String,
                trim: true,
                maxlength: 2000,
                default: "",
            },

            consent: {
                type: Boolean,
                required: true,
                validate: {
                    validator: (value) =>
                        value === true,
                    message:
                        "Consent is required",
                },
            },

            status: {
                type: String,
                enum: [
                    "PENDING",
                    "APPROVED",
                    "REJECTED",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "CANCELLED",
                ],
                default: "PENDING",
                index: true,
            },
        },
        {
            timestamps: true,
        }
    );

sanitizationRequestSchema.pre(
    "validate",
    async function () {
        if (!this.requestId) {
            const count =
                await mongoose
                    .model(
                        "SanitizationRequest"
                    )
                    .countDocuments();

            this.requestId =
                `REQ-${String(
                    count + 1
                ).padStart(5, "0")}`;
        }
    }
);

const SanitizationRequest =
    mongoose.model(
        "SanitizationRequest",
        sanitizationRequestSchema
    );

module.exports =
    SanitizationRequest;