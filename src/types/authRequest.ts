import { Request } from "express";
import { UserDocument } from "../models/User";

export interface AuthRequest extends Request<any, any, any, any> {
    cookies: {
        token: string;
    };
    user: UserDocument;
}
