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


module.exports = router;