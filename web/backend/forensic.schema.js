const Joi = require("joi");

const forensicCaseSchema = Joi.object({
    title: Joi.string().trim().min(3).max(150).required(),
    description: Joi.string().trim().max(2000).allow("").optional(),
    sourceType: Joi.string().valid("PHYSICAL_DEVICE", "FORENSIC_IMAGE").required(),
    sourceName: Joi.string().trim().min(1).max(200).required(),
    sourceIdentifier: Joi.string().trim().max(300).allow("").optional(),
    deviceType: Joi.string().trim().max(100).allow("").optional(),
    capacity: Joi.string().trim().max(100).allow("").optional(),
    assetIdentifier: Joi.string().trim().max(100).allow("").optional(),
    workstationCenter: Joi.string().trim().required()
});

module.exports = { forensicCaseSchema };