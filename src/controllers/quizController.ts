import { Request, Response } from "express";
import mongoose from "mongoose";
import { Controller } from "../decorators/controller";
import { Route } from "../decorators/route";
import { Question } from "../models/Question";
import { Quiz } from "../models/Quiz";


@Controller("/quiz")
export class QuizController {

    @Route("get", "/")
    async getAllQuizzes(req: Request, res: Response) {
        const { populate, limit } = req.query;
        try {
            const quizzes = await Quiz.find()
                .populate(populate === "true" ? [{
                    path: "questions",
                    model: Question
                }] : [])
                .limit(Number(limit));
            res.json(quizzes);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    
    @Route("get", "/:id")
    async getQuizById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const populate = req.query.populate === "true";
            const quiz = await Quiz.findById(id).populate(populate ? [{
                path: "questions",
                model: Question
            }] : []);

            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            res.json({ quiz });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("post", "/")
    async createQuiz(req: Request, res: Response) {
        try {
            const { title, questionIds } = req.body;
            const quiz = new Quiz({ title, questions: questionIds });
            await quiz.save();
            res.json(quiz);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("patch", "/:id")
    async updateQuestion(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, questionIds } = req.body;

            const quiz = await Quiz.findById(id);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }

            const updateData: any = {};
            if (title) updateData.title = title;
            if (questionIds) updateData.questions = questionIds;

            const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateData, { new: true });

            const response: any = { message: "Quiz updated successfully" };
            if (title && !questionIds) {
                response.title = updatedQuiz?.title;
            } else {
                response.quiz = updatedQuiz;
            }

            res.json(response);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("delete", "/:id")
    async deleteQuiz(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const quiz = await Quiz.findById(id);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            await Quiz.findByIdAndDelete(id);
            res.json({ message: "Quiz deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("post", "/:id/questions")
    async addQuestionsToQuiz(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { questionId, questionIds } = req.body;

            const quiz = await Quiz.findById(id);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }

            if (questionId) {
                const question = await Question.findById(questionId);
                if (!question) {
                    return res.status(404).json({ message: "Question not found" });
                }

                const questionExists = quiz.questions.includes(new mongoose.Types.ObjectId(questionId));
                if (questionExists) {
                    return res.status(400).json({ message: "Question already exists in quiz" });
                }

                const updatedQuiz = await Quiz.findByIdAndUpdate(
                    id, 
                    { $push: { questions: questionId } }, 
                    { new: true }
                );
                return res.json(updatedQuiz);
            }


            if (questionIds) {
                const questions = await Question.find({ _id: { $in: questionIds } });
                if (questions.length !== questionIds.length) {
                    return res.status(404).json({ message: "One or more questions not found" });
                }

                const existingQuestions = questionIds.filter((qId: string) => 
                    quiz.questions.includes(new mongoose.Types.ObjectId(qId))
                );
                if (existingQuestions.length > 0) {
                    return res.status(400).json({ 
                        message: "Some questions already exist in quiz",
                        existingQuestions
                    });
                }

                const updatedQuiz = await Quiz.findByIdAndUpdate(
                    id, 
                    { $push: { questions: { $each: questionIds } } }, 
                    { new: true }
                );
                return res.json(updatedQuiz);
            }

            return res.status(400).json({ message: "Either questionId or questionIds must be provided" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("patch", "/:id/questions/:questionId")
    async updateQuestionInQuiz(req: Request, res: Response) {
        try {
            const { id, questionId } = req.params;
            const updateData = req.body;

            const quiz = await Quiz.findById(id);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }

            const question = await Question.findById(questionId);
            if (!question) {
                return res.status(404).json({ message: "Question not found" });
            }

            const questionExists = quiz.questions.includes(new mongoose.Types.ObjectId(questionId));
            if (!questionExists) {
                return res.status(404).json({ message: "Question not found in quiz" });
            }

            const updatedQuestion = await Question.findByIdAndUpdate(
                questionId,
                { $set: updateData },
                { new: true }
            );

            res.json({
                message: "Question updated successfully",
                question: updatedQuestion
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("delete", "/:id/questions/:questionId")
    async deleteQuestionFromQuiz(req: Request, res: Response) {
        try {
            const { id, questionId } = req.params;
            
            const quiz = await Quiz.findById(id);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }

            const questionExists = quiz.questions.includes(new mongoose.Types.ObjectId(questionId));
            if (!questionExists) {
                return res.status(404).json({ message: "Question not found in quiz" });
            }

            const updatedQuiz = await Quiz.findByIdAndUpdate(id, { $pull: { questions: questionId } }, { new: true });
            res.json(updatedQuiz);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Route("delete", "/:id/questions")
    async deleteQuestionsFromQuiz(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { questionIds } = req.body;

            const quiz = await Quiz.findById(id);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }

            const allQuestionsExist = questionIds.every((qId: string) => quiz.questions.includes(new mongoose.Types.ObjectId(qId)));
            if (!allQuestionsExist) {
                return res.status(404).json({ message: "One or more questions not found in quiz" });
            }

            const updatedQuiz = await Quiz.findByIdAndUpdate(id, 
                { $pull: { questions: { $in: questionIds } } }, 
                { new: true }
            );
            res.json(updatedQuiz);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

}