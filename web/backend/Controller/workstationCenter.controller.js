const asyncHandler = require("../utils/asyncHandler");
const { createWorkstationCenter } = require("../services/workstationCenter.services");

module.exports.createWorkStationCenter = asyncHandler(async (req, res) => {
    const workstationCenter = await createWorkstationCenter(req.body);

    res.status(201).json({
        success: true,
        data: workstationCenter,
    });
});