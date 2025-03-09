import dotenv from "dotenv";
import { connectDB } from "./config/db";
import passport from "./config/passport";
import {app} from "./config/server";
import { errorHandler } from "./middlewares/errorHandler";
import logger, { requestLogger } from "./utils/logger";
import { defineRoutes } from "./utils/defineRoutes";
import { AuthController } from "./controllers/authController";
import { UserController } from "./controllers/userController";
import { QuestionController } from "./controllers/questionContoller";

dotenv.config();

const port = process.env.PORT || 8000;
const nodeEnv = process.env.NODE_ENV;

const controllers = [
    AuthController,
    UserController,
    QuestionController,
    UserController
]

connectDB();

defineRoutes(
    controllers,
    app
)

app.use(passport.initialize());
app.use(errorHandler);
app.use(requestLogger);

app.get("/health", async (_, res) => {
    try {

        const usedMemory = process.memoryUsage();
        const uptime = process.uptime();

        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            system: {
                memory: {
                    heapUsed: `${Math.round(usedMemory.heapUsed / 1024 / 1024)}MB`,
                    heapTotal: `${Math.round(usedMemory.heapTotal / 1024 / 1024)}MB`,
                    rss: `${Math.round(usedMemory.rss / 1024 / 1024)}MB`
                },
                uptime: `${Math.round(uptime)}s`
            },
            environment: nodeEnv
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

const server = app.listen(port, () => {
    logger.info(`Server is running in ${nodeEnv} mode on http://localhost:${port}`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

export default app;