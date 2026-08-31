const asyncHandler = require("../utils/asyncHandler");
const { createWorkstationCenter,
    getWorkstationCenterById,
    assignEmployees,
    getActiveWorkstationCenters,
    getMyWorkstationCenter,
    getEligibleEmployees
    } = require("../services/workstationCenter.services");

module.exports.createWorkStationCenter = asyncHandler(async (req, res, next) => {
    const workstationCenter = await createWorkstationCenter(req.body);

    res.status(201).json({
        success: true,
        data: workstationCenter,
    });

});

module.exports.getWorkstationCenterById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const workstationCenter = await getWorkstationCenterById(id, req.user);

    res.status(200).json({
        success: true,
        message: "Workstation center fetched successfully",
        data: workstationCenter
    });

});

module.exports.assignEmployees = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { employeesIds } = req.body;
    const center = await assignEmployees(id, employeesIds, req.user);
    res.status(200).json({
        success: true,
        message: "Employee assigned successfully",
        data: center,
    })


})

module.exports.getActiveWorkstationCenters =
    asyncHandler(
        async (req, res) => {

            const centers =
                await getActiveWorkstationCenters();

            res.status(200).json({
                success: true,

                message:
                    "Active workstation centers fetched successfully",

                data: centers
            });
        }
    );

    module.exports.getMyWorkstationCenter =
    asyncHandler(
        async (req, res) => {

            const center =
                await getMyWorkstationCenter(
                    req.user
                );

            res.status(200).json({
                success: true,

                message:
                    "Workstation center fetched successfully",

                data: center
            });
        }
    );

module.exports.getEligibleEmployees = asyncHandler(
    async (req, res) => {

        const { id } = req.params;

        const employees = await getEligibleEmployees(
            id,
            req.user
        );

        res.status(200).json({
            success: true,
            message: "Eligible employees fetched successfully",
            data: employees
        });
    }
);