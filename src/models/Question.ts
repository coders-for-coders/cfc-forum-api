import mongoose, { Document, Schema } from "mongoose";

interface QuestionDocument extends Document {
    category: string;
    question: string;
    options: { [key: string]: string };
    correct_answer: string;
    createdAt: Date;
    updatedAt: Date;
}

const questionSchema = new Schema<QuestionDocument>({
    category: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: Map, of: String, required: true },
    correct_answer: { type: String, required: true }
}, {
    timestamps: true
});

export const Question = mongoose.model<QuestionDocument>("Question", questionSchema);
