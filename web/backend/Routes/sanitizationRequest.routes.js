const express = require("express");

const router =
    express.Router();

const {
    Authenticate,
} = require(
    "../middlewares/auth.middleware"
);

const {
    Authorize,
} = require(
    "../middlewares/authorize.middleware"
);

const {
    validate,
} = require(
    "../middlewares/validate.middleware"
);

const {
    sanitizationRequestSchema,
} = require("../schema");

const controller =
    require(
        "../Controller/sanitizationRequest.controller"
    );


/*
 * CUSTOMER
 * Create sanitization request
 */
router.post(
    "/",
    Authenticate,
    Authorize("CUSTOMER"),
    validate(
        sanitizationRequestSchema
    ),
    controller.createSanitizationRequest
);
router.get(
    "/my",
    Authenticate,
    Authorize("CUSTOMER"),
    controller.getMySanitizationRequests
);

/*
 * WORKSTATION HEAD
 * Get pending requests for own center
 */
router.get(
    "/head",
    Authenticate,
    Authorize("WORKSTATION_HEAD"),
    controller.getHeadSanitizationRequests
);

router.get(
    "/head/approved",
    Authenticate,
    Authorize("WORKSTATION_HEAD"),
    controller.getHeadApprovedSanitizationRequests
);

router.get(
    "/head/all",
    Authenticate,
    Authorize("WORKSTATION_HEAD"),
    controller.getAllHeadSanitizationRequests
);

router.patch(
    "/:requestId/assign",
    Authenticate,
    Authorize("WORKSTATION_HEAD"),
    controller.assignSanitizationRequest
);

router.patch(
    "/:requestId/status",
    Authenticate,
    Authorize("WORKSTATION_HEAD"),
    controller.updateSanitizationRequestStatus
);

/*
 * WORKSTATION EMPLOYEE
 * Get sanitization requests assigned
 * to the logged-in employee
 */
router.get(
    "/employee",
    Authenticate,
    Authorize(
        "WORKSTATION_EMPLOYEE"
    ),
    controller.getEmployeeSanitizationRequests
);

router.patch(
    "/:requestId/employee-status",
    Authenticate,
    Authorize(
        "WORKSTATION_EMPLOYEE"
    ),
    controller.updateEmployeeSanitizationStatus
);

/*
 * ADMIN
 * Get all sanitization requests
 */
router.get(
    "/",
    Authenticate,
    Authorize("ADMIN"),
    controller.getAllSanitizationRequests
);

/*
 * Approve or reject sanitization request
 */


module.exports = router;