import { UserDocument } from "../models/User";

export interface AuthRequest extends Request {
    cookies: {
        token: string;
    };
    user?: UserDocument;
}

export interface User extends UserDocument {
    password: string;
}