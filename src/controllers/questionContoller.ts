import { Controller } from "../decorators/controller";
import { Route } from "../decorators/route";
import { Request, Response } from "express";
import { Question } from "../models/Question";


@Controller("/questions")
export class QuestionController {

    @Route("get", "/")
    async getAllQuestions(req: Request, res: Response) {
        const { limit, search, sortBy, sortOrder } = req.query;
        try {
            let query = Question.find();

            if (limit) {
                query = query.limit(Number(limit));
            }

            if (search) {
                query = query.where("question").regex(search as string);
            }

            if (sortBy && ["category", "updatedAt"].includes(sortBy as string)) {
                query = query.sort({ [sortBy as string]: sortOrder as string === "asc" ? 1 : -1 });
            }

            const questions = await query;
            res.json(questions);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("get", "/:id")
    async getQuestionById(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const question = await Question.findById(id);
            if (!question) {
                return res.status(404).json({ message: "Question not found" });
            }
            res.json(question);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("post", "/")
    async createQuestion(req: Request, res: Response) {
        const { question, category, options, answer } = req.body;
        try {
            const data = new Question({
                question: question,
                category: category,
                options: options,
                correct_answer: answer
            });
            await data.save();
            res.json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("patch", "/:id")
    async updateQuestion(req: Request, res: Response) {
        const { id } = req.params;
        const { question, category, options, answer } = req.body;
        try {
            const data = await Question.findByIdAndUpdate(id, {
                question: question,
                category: category,
                options: options,
                correct_answer: answer
            }, { new: true });
            res.json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("delete", "/:id")
    async deleteQuestion(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await Question.findByIdAndDelete(id);
            res.json({ message: "Question deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

//  /api/questions?limit=10&search=test&sortBy=updatedAt&sortOrder=desc