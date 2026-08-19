require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;

const authRoute = require("./Routes/auth.routes");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");


app.use("/api/auth", authRoute);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed");
        process.exit(1);
    }
};

startServer();