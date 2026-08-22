const app = require("./app");

const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

//server starting
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