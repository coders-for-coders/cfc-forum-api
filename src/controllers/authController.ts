import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { UserModel } from '../models/User';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

@Controller('/auth')
export class AuthController {
    @Route('post', '/register')
    async register(req: Request, res: Response) {
        try {
            const { email, username, fullname, password } = req.body as {
                email: string;
                username: string;
                fullname: string;
                password: string;
            };

            if (!email || !username || !fullname || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await UserModel.create({ email, username, fullname, password: hashedPassword });

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            const userWithoutPassword = user.toObject();
            const { password: _, ...userWithoutPasswordObj } = userWithoutPassword;
            res.status(201).json({ user: userWithoutPasswordObj });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    @Route('post', '/login')
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body as { email: string; password: string };
            
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            const userWithoutPassword = user.toObject();
            const { password: _, ...userWithoutPasswordObj } = userWithoutPassword;
            res.status(200).json({ user: userWithoutPasswordObj });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}