import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import { AuthController } from "./controllers/authController";
import { QuestionController } from "./controllers/questionContoller";
import { QuizController } from "./controllers/quizController";
import { defineRoutes } from "./library/routes";

import logger, { requestLogger } from "./utils/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(requestLogger);

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

mongoose
    .connect(process.env.DATABASE_URL!)
    .then(() => {
        logger.info("Successfully connected to MongoDB");
    })
    .catch((err) => {
        logger.error("MongoDB connection error:", err);
        process.exit(1);
    });

mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    logger.info("MongoDB disconnected");
});

app.get("/", (_, res) => {
    res.send("Hello World");
});

defineRoutes([AuthController, QuizController, QuestionController], app);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
}
);

process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
});

export default app;
