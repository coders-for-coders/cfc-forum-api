import { Response } from "express";
import { Controller } from "../decorators/controller";
import { Get, Patch, Post } from "../decorators/route";
import { authMiddleware } from "../middlewares/authMiddleware";
import { AnswerModel } from "../models/Answer";
import { AuthRequest } from "../types/authRequest";

@Controller("/answer")
export class AnswerControler {

    @Get("/all/:questionId")
    async getAllAnswer(req: AuthRequest, res: Response) {
        const { questionId } = req.params;

        try {
            const answers = await AnswerModel.find({ question: questionId })
                .populate('author', 'username avatar reputation')
                .sort({ createdAt: -1 });

            res.status(200).json(answers);
        } catch (error) {
            res.status(500).json({ message: "Error fetching answers", error: error });
        }
    }

    @Post("/:questionId", authMiddleware)
    async createAnswer(req: AuthRequest, res: Response) {
        const { content } = req.body;
        const { questionId } = req.params;

        try {
            const answer = new AnswerModel({
                question: questionId,
                content: content,
                author: req.user._id
            });

            await answer.save();
            res.status(201).json(answer);
        } catch (error) {
            res.status(500).json({ message: "Error creating answer", error: error });
        }
    }

    @Get("/:questionId/:answerId")
    async getAnswer(req: AuthRequest, res: Response) {
        const { questionId, answerId } = req.params;

        try {
            const answer = await AnswerModel.findOne({
                _id: answerId,
                question: questionId
            }).populate('author', 'username');

            if (!answer) {
                return res.status(404).json({ message: "Answer not found" });
            }

            res.status(200).json(answer);
        } catch (error) {
            res.status(500).json({ message: "Error fetching answer", error: error });
        }
    }

    @Patch("/:questionId/:answerId", authMiddleware)
    async updateAnswer(req: AuthRequest, res: Response) {
        const { content } = req.body;
        const { questionId, answerId } = req.params;

        try {
            const answer = await AnswerModel.findOneAndUpdate(
                {
                    _id: answerId,
                    question: questionId,
                    author: req.user._id
                },
                { content },
                { new: true }
            ).populate('author', 'username');

            if (!answer) {
                return res.status(404).json({ message: "Answer not found or unauthorized" });
            }

            res.status(200).json(answer);
        } catch (error) {
            res.status(500).json({ message: "Error updating answer", error: error });
        }
    }

}
