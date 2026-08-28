const express = require("express");
const router = express.Router();

const { validate } = require("../middlewares/validate.middleware");
const { Authenticate } = require("../middlewares/auth.middleware");
const { Authorize } = require("../middlewares/authorize.middleware");
const { workstationCenterSchema } = require("../schema");
const workstationController = require("../Controller/workstationCenter.controller");

router.post(
    "/",
    Authenticate,
    Authorize("ADMIN"),
    validate(workstationCenterSchema),
    workstationController.createWorkStationCenter
);

router.get(
    "/",
    Authenticate,
    Authorize("CUSTOMER"),
    workstationController.getActiveWorkstationCenters
);

router.get(
    "/my",
    Authenticate,
    Authorize("WORKSTATION_HEAD"),
    workstationController.getMyWorkstationCenter
);

router.get(
    "/:id",
    Authenticate,
    workstationController.getWorkstationCenterById
);

router.post(
    "/:id/employees",
    Authenticate,
    Authorize(
        "ADMIN",
        "WORKSTATION_HEAD"
    ),
    workstationController.assignEmployees
);

module.exports = router;