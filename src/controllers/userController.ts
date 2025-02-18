import { Response } from "express";
import { Controller } from "../decorators/controller";
import { Route } from "../decorators/route";
import { authMiddleware } from "../middlewares/authMiddleware";
import { UserModel } from "../models/User";
import { AuthRequest } from "../types/user";

@Controller('/user')
export class UserController {

    @Route('get', '/', authMiddleware)
    async getUser(req: AuthRequest, res: Response) {
        try {
            const user = await UserModel.findById(req.user?.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

}