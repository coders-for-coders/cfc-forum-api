import bcrypt from 'bcryptjs';

import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import passport from 'passport';

import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { AdminModel } from '../models/Admin';
import { UserModel } from '../models/User';

@Controller('/auth')
export class AuthController {


    @Route('get', '/github')
    githubAuth(req: Request, res: Response, next: Function) {
        passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
    }

    @Route('get', '/github/callback')
    githubCallback(req: Request, res: Response, next: Function) {
        passport.authenticate('github', { failureRedirect: '/login' }, (err: any , user: any) => {
            if (err || !user) {
                return res.redirect('/login');
            }
            
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.redirect('/');
        })(req, res, next);
    }

    @Route('get', '/discord')
    discordAuth(req: Request, res: Response, next: Function) {
        passport.authenticate('discord')(req, res, next);
    }

    


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
                sameSite: 'lax',
                path: '/',
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

    @Route('post', '/admin/register')
    async registerAdmin(req: Request, res: Response) {
        try {
            const { email, password, fullname, username } = req.body as {
                email: string;
                password: string;
                fullname: string;
                username: string;
            };

            if (!email || !password || !fullname || !username) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const existingAdmin = await AdminModel.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Admin already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const admin = await AdminModel.create({ email, password: hashedPassword, fullname, username });

            const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET as string);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const adminWithoutPassword = admin.toObject();
            const { password: _, ...adminWithoutPasswordObj } = adminWithoutPassword;
            res.status(201).json({ admin: adminWithoutPasswordObj });
        } catch (error) {
            console.error('Admin register error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    @Route('post', '/admin/login')
    async loginAdmin(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
            }

            const admin = await AdminModel.findOne({ username });
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const token = jwt.sign(
                { id: admin._id, role: 'admin' },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d' }
            );
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.status(200).json({
                success: true,
                token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    fullname: admin.fullname
                }
            });
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}