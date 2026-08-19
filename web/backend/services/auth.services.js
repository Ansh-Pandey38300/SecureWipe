const argon2 = require("argon2");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const registerUser = async ({ name, email, password }) => {

    const existingUser = await User.findOne({ email });

    if (existingUser) throw new AppError("User already exists", 409);

    const hashPassword = await argon2.hash(password);

    const user = await User.create({
        name,
        email,
        password: hashPassword,
    });

    return user;

}

module.exports = {
    registerUser
}