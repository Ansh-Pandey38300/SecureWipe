const mongoose = require("mongoose");
require("dotenv").config();

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("TEST DB CONNECTED");
});

afterAll(async () => {
    await mongoose.connection.close();
    console.log("TEST DB DISCONNECTED");
});