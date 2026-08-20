const WorkstationCenter = require("../models/WorkstationCenter");
const AppError = require("../utils/AppError");

const createWorkstationCenter = async (data) => {
    const workstationCenter = await WorkstationCenter.create(data);
    return workstationCenter;
}

module.exports = {
    createWorkstationCenter,
}