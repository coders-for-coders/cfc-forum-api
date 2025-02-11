import mongoose, { Schema, Document, Types } from "mongoose";

interface QuizDocument extends Document {
    title: string;
    questions: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const quizSchema = new Schema<QuizDocument>({
    title: { type: String, required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question", required: true }]
}, {
    timestamps: true
});

export const Quiz = mongoose.model<QuizDocument>("Quiz", quizSchema);

interface UserQuizAttemptDocument extends Document {
    user: Types.ObjectId;
    quiz: Types.ObjectId;
    responses: { question: Types.ObjectId; selectedOption: string }[];
    score: number;
    createdAt: Date;
}

const userQuizAttemptSchema = new Schema<UserQuizAttemptDocument>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    responses: [{
        question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        selectedOption: { type: String, required: true }
    }],
    score: { type: Number, default: 0 }
}, {
    timestamps: true
});

export const UserQuizAttempt = mongoose.model<UserQuizAttemptDocument>("UserQuizAttempt", userQuizAttemptSchema);
