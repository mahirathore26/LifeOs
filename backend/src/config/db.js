import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        });

        console.log(
            `✅ MongoDB Connected: ${connection.connection.host}/${connection.connection.name}`
        );

        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️ MongoDB disconnected.");
        });

        mongoose.connection.on("reconnected", () => {
            console.info("🔄 MongoDB reconnected.");
        });

        mongoose.connection.on("error", (error) => {
            console.error("❌ MongoDB Error:", error);
        });

        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Closing MongoDB connection...`);

            await mongoose.connection.close();

            console.log("✅ MongoDB connection closed.");

            process.exit(0);
        };

        process.once("SIGINT", () => gracefulShutdown("SIGINT"));
        process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));

    } catch (error) {
        console.error("❌ Failed to connect to MongoDB");
        console.error(error);

        process.exit(1);
    }
};

export default connectDB;