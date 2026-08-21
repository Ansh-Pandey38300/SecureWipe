const express = require("express");
const router = express.Router();
const workstationController = require("../Controller/workstationCenter.controller");


router.post("/", workstationController.createWorkStationCenter);

module.exports = router;