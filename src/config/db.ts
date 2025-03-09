import mongoose from "mongoose";
import logger from "../utils/logger";

const connectWithRetry = () => {
    mongoose
        .connect(process.env.DATABASE_URL!, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        .then(() => {
            logger.info("Successfully connected to MongoDB");
        })
        .catch((err) => {
            logger.error("MongoDB connection error:", err);
            logger.info("Retrying connection in 5 seconds...");
            setTimeout(connectWithRetry, 5000);
        });
};

export const connectDB = () => {
    connectWithRetry();

    mongoose.connection.on("error", (err) => {
        logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
        logger.info("MongoDB disconnected");
        if (process.env.NODE_ENV === 'production') {
            connectWithRetry();
        }
    });
};