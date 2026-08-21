const User = require("../models/User");
const WorkstationCenter = require("../models/WorkstationCenter");
const AppError = require("../utils/AppError");

const createWorkstationCenter = async (data) => {
    const head = User.findById(data.head);

    if (!head) throw new AppError("Workstation head not found", 404);

    if (head.status != "ACTIVE") throw new AppError(
        "Selected workstation head is inactive",
        400
    );

    if (head.role != WORKSTATION_HEAD) throw new AppError(
        "Selected user is not a workstation head",
        400
    );

    const existingCenter = await WorkstationCenter.findOne({
        head,
    });

    if (existingCenter) {
        throw new AppError(
            "This workstation head is already assigned to a center",
            409
        );
    }

    const workstationCenter =
        await WorkstationCenter.create(data);

    return workstationCenter;
}

const getWorkstationCenterById = async (centerId, user) => {
    const center = await WorkstationCenter.findById(centerId);
    if (!center) {
        throw new AppError("Workstation center does not exist", 404);
    }

    if (user.role == "ADMIN") {
        return center;
    }

    if (user.role == "WORKSTATION_HEAD") {
        if (!centerId.equals(user._id)) {
            throw new AppError(
                "You are not authorized to access this workstation center",
                403
            );
        }
        return center;
    }

    if (user.role == "CUSTOMER") {
        return {
            centerId: center.centerId,
            name: center.name,
            location: workstationCenter.location,
            status: workstationCenter.status
        }
    }



}

module.exports = {
    createWorkstationCenter,
    getWorkstationCenterById,
}