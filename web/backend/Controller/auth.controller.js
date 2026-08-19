const asyncHandler = require("../utils/asyncHandler");
const { registerUser } = require("../services/auth.services");

module.exports.registerUser = asyncHandler(async (req, res, next) => {
    console.log("hello");
    const user = registerUser(req.body);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user
    });

})