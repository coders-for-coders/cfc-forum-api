import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";

import { UserModel } from "./models/User";

import { AuthController } from "./controllers/authController";
import { QuestionController } from "./controllers/questionContoller";
import { QuizController } from "./controllers/quizController";
import { UserController } from "./controllers/userController";

import { defineRoutes } from "./library/defineRoutes";

import logger, { requestLogger } from "./library/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

app.use(helmet());

app.use(passport.initialize());

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    callbackURL: 'http://localhost:4000/api/auth/github/callback'
},
    async (accessToken: string, refreshToken: string, profile, done) => {
        try {
            let user = await UserModel.findOne({ githubId: profile.id });
            if (!user) {
                user = await UserModel.create({
                    githubId: profile.id,
                    username: profile.username,
                    email: profile.emails?.[0].value,
                    fullname: profile.displayName,
                    githubAccessToken: accessToken,
                    githubRefreshToken: refreshToken,

                });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, (user as any).id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});


app.use(requestLogger);

app.use(cors({
    origin: isProduction ? process.env.FRONTEND_URL : "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));


// if (isProduction) {
//     const rateLimit = require('express-rate-limit');
//     app.use(rateLimit({
//         windowMs: 15 * 60 * 1000, // 15 minutes
//         max: 100 // limit each IP to 100 requests per windowMs
//     }));
// }

app.use(cookieParser());

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

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

connectWithRetry();

mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    logger.info("MongoDB disconnected");
    if (isProduction) {
        connectWithRetry();
    }
});

app.get("/health", (_, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

const controllers = [
    AuthController,
    QuizController,
    QuestionController,
    UserController,
];

defineRoutes(controllers, app);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.stack);
    res.status(500).json({
        error: isProduction ? "Internal Server Error" : err.message,
        ...(isProduction ? {} : { stack: err.stack })
    });
});

process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});


const server = app.listen(port, () => {
    logger.info(`Server is running in ${nodeEnv} mode on http://localhost:${port}`);
});


server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

export default app;
