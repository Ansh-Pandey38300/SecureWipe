const mongoose = require("mongoose");
const User = require("../models/User");
const Workstation = require("../models/WorkStation");
const WorkstationCenter = require("../models/WorkstationCenter");
const AppError = require("../utils/AppError");

const createWorkstationCenter = async (data) => {
    const head = await User.findById(data.head);

    if (!head) {
        throw new AppError(
            "Workstation head not found",
            404
        );
    }

    if (head.status !== "ACTIVE") {
        throw new AppError(
            "Selected workstation head is inactive",
            400
        );
    }

    if (head.role !== "WORKSTATION_HEAD") {
        throw new AppError(
            "Selected user is not a workstation head",
            400
        );
    }

    const existingCenter = await WorkstationCenter.findOne({
        head: head._id,
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
};

const getWorkstationCenterById = async (centerId, user) => {

    const center = await WorkstationCenter.findOne({
        centerId: centerId
    })
        .populate(
            "head",
            "name email"
        )
        .populate(
            "employees",
            "name email role status"
        );

    if (!center) {
        throw new AppError(
            "Workstation center does not exist",
            404
        );
    }

    // Find all workstations belonging to this center
    const workstations = await Workstation.find({
        workstationCenter: center._id
    }).select(
        "workstationId name status connectionStatus hostname operatingSystem enrolledAt"
    );

    if (user.role === "ADMIN") {
        return {
            centerId: center.centerId,
            name: center.name,
            location: center.location,
            status: center.status,
            head: center.head,
            employees: center.employees,
            workstations: workstations,
            createdAt: center.createdAt,
            updatedAt: center.updatedAt
        };
    }

    if (user.role === "WORKSTATION_HEAD") {

        if (!center.head._id.equals(user._id)) {
            throw new AppError(
                "You are not authorized to access this workstation center",
                403
            );
        }

        return {
            centerId: center.centerId,
            name: center.name,
            location: center.location,
            status: center.status,
            employees: center.employees,
            workstations: workstations
        };
    }

    if (user.role === "CUSTOMER") {
        return {
            centerId: center.centerId,
            name: center.name,
            location: center.location,
            status: center.status,

            head: {
                name: center.head.name
            }
        };
    }

    throw new AppError(
        "You are not authorized to access this workstation center",
        403
    );
};

const assignEmployees = async (
    centerId,
    employeesIds,
    currentUser
) => {

    // 1. employeesIds array check
    if (
        !Array.isArray(employeesIds) ||
        employeesIds.length === 0
    ) {
        throw new AppError(
            "At least one employee is required",
            400
        );
    }

    // 2. Find workstation center
    const center = await WorkstationCenter.findOne({
        centerId
    });

    if (!center) {
        throw new AppError(
            "Workstation center not found",
            404
        );
    }

    // 3. If requester is WORKSTATION_HEAD,
    //    he can only assign employees to his own center
    if (currentUser.role === "WORKSTATION_HEAD") {

        if (
            center.head.toString() !==
            currentUser._id.toString()
        ) {
            throw new AppError(
                "You can only assign employees to your own center",
                403
            );
        }
    }

    // 4. Remove duplicate employee IDs
    const uniqueemployeesIds = [
        ...new Set(
            employeesIds.map(id => id.toString())
        )
    ];

    // Check whether every ID is a valid MongoDB ObjectId
    const invalidEmployeeId =
        uniqueemployeesIds.find(
            id => !mongoose.Types.ObjectId.isValid(id)
        );

    if (invalidEmployeeId) {
        throw new AppError(
            `Invalid employee ID: ${invalidEmployeeId}`,
            400
        );
    }

    const employeeObjectIds =
        uniqueemployeesIds.map(
            id => new mongoose.Types.ObjectId(id)
        );

    // 5. Find all selected users
    const employees = await User.find({
        _id: {
            $in: employeeObjectIds
        }
    });

    // 6. Check all employees exist
    if (
        employees.length !==
        employeeObjectIds.length
    ) {
        throw new AppError(
            "One or more employees were not found",
            404
        );
    }

    // 7. Make sure all users are workstation employees
    const invalidEmployee = employees.find(
        user =>
            user.role !==
            "WORKSTATION_EMPLOYEE"
    );

    if (invalidEmployee) {
        throw new AppError(
            "Only workstation employees can be assigned",
            400
        );
    }

    // 8. Check whether active or inactive
    const inactiveEmployee = employees.find(
        user =>
            user.status !== "ACTIVE"
    );

    if (inactiveEmployee) {
        throw new AppError(
            "One or more employees are inactive",
            400
        );
    }

    // 9. Check whether any employee is already assigned
    const alreadyAssigned = employees.filter(
        employee =>
            employee.workstationCenter
    );

    if (alreadyAssigned.length > 0) {
        throw new AppError(
            "One or more employees are already assigned to a workstation center",
            400
        );
    }

    // 10. Add employees to center
    center.employees.push(
        ...employeeObjectIds
    );

    await center.save();

    // 11. Update each employee's workstationCenter
    await User.updateMany(
        {
            _id: {
                $in: employeeObjectIds
            }
        },
        {
            $set: {
                workstationCenter: center._id
            }
        }
    );

    return center;
};

module.exports = {
    createWorkstationCenter,
    getWorkstationCenterById,
    assignEmployees
};