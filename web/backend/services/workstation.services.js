const Workstation = require("../models/WorkStation");
const WorkstationCenter = require("../models/WorkstationCenter");
const AppError = require("../utils/AppError");
const Counter = require("../models/Counter");

const generateWorkstationId = async () => {

    const counter =
        await Counter.findOneAndUpdate(
            {
                name: "workstation"
            },
            {
                $inc: {
                    sequence: 1
                }
            },
            {
                new: true,
                upsert: true
            }
        );

    return `WS-${String(
        counter.sequence
    ).padStart(4, "0")}`;
};

const createWorkstation = async (data) => {

    const existingWorkstation = await Workstation.findOne({
        name: data.name
    });

    if (existingWorkstation) {
        throw new AppError(
            "A workstation with this name already exists",
            409
        );
    }

    const center = await WorkstationCenter.findOne({
        centerId: data.workstationCenterId
    });

    if (!center) {
        throw new AppError(
            "Workstation center not found",
            404
        );
    }

    const workstationId = await generateWorkstationId();

    const workstation = await Workstation.create({
        workstationId,
        name: data.name,
        status: data.status,
        workstationCenter: center._id
    });

    return workstation;
};

module.exports = {
    createWorkstation
};