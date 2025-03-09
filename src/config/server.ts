import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const version = "v1";

app.use(helmet());
app.use(cors({
    origin: ["http://localhost:3000", "https://qna.codersforcoders.tech"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

export  { app, version };