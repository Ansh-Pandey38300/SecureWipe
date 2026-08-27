const asyncHandler = require("../utils/asyncHandler");

const {
    createWorkstation
} = require("../services/workstation.services");

module.exports.createWorkstation = asyncHandler(
    async (req, res, next) => {

        const workstation = await createWorkstation(req.body);

        res.status(201).json({
            success: true,
            message: "Workstation created successfully",
            data: workstation
        });
    }
);