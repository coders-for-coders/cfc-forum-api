import { Request, Response } from "express";
import { Controller } from "../decorators/controller";
import { Route } from "../decorators/route";
import { QuestionModel } from "../models/Question";
import { authMiddleware } from "../middlewares/authMiddleware";
import { AuthRequest } from "../types/authRequest";

@Controller("/question")
export class QuestionController {

    @Route("get", "/")
    async getAllQuestions(req: Request, res: Response) {
        const { limit, search, sortBy, sortOrder } = req.query;
        try {
            let query = QuestionModel.find().populate("author", "username reputation avatar");

            if (limit) {
                query = query.limit(Number(limit));
            }

            if (search) {
                query = query.find({
                    $or: [
                        { title: { $regex: search as string, $options: "i" } },
                        { description: { $regex: search as string, $options: "i" } },
                    ],
                });
            }

            if (sortBy && ["votes", "answers", "views", "createdAt", "updatedAt"].includes(sortBy as string)) {
                query = query.sort({ [sortBy as string]: sortOrder === "asc" ? 1 : -1 });
            }

            const questions = await query.exec();
            res.json(questions);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error });
        }
    }

    @Route("get", "/:id")
    async getQuestionById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const question = await QuestionModel.findById(id).populate("author", "username reputation avatar");
            if (!question) {
                return res.status(404).json({ message: "Question not found" });
            }
            res.json(question);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error });
        }
    }

    @Route("post", "/", authMiddleware)
    async createQuestion(req: AuthRequest, res: Response) {
        const { title, description, tags } = req.body;

        try {
            const data = new QuestionModel({
                title,
                description,
                tags,
                author: req.user._id,
            });
            await data.save();
            res.status(201).json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error });
        }
    }

    @Route("patch", "/:id")
    async updateQuestion(req: Request, res: Response) {
        const { id } = req.params;
        const updates = req.body;
        try {
            const data = await QuestionModel.findByIdAndUpdate(id, updates, { new: true }).populate("author", "username reputation avatar");
            if (!data) {
                return res.status(404).json({ message: "Question not found" });
            }
            res.json(data).status(201);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error });
        }
    }

    @Route("delete", "/:id")
    async deleteQuestion(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const deleted = await QuestionModel.findByIdAndDelete(id);
            if (!deleted) {
                return res.status(404).json({ message: "Question not found" });
            }
            res.json({ message: "Question deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error });
        }
    }
}
