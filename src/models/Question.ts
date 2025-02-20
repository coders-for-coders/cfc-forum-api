import mongoose, { Document, Schema } from "mongoose";

interface VoteType {
    up: number;
    down: number;
}

interface QuestionDocument extends Document {
    votes: VoteType;
    answers: {
        count: number;
        answers: object[];
    };
    views: number;
    title: string;
    description: string;
    tags: string[];
    author: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const questionSchema = new Schema<QuestionDocument>(
    {
        votes: {
            up: { type: Number, default: 0 },
            down: { type: Number, default: 0 }
        },
        answers: {
            count: { type: Number, default: 0 },
            answers: [{ type: Schema.Types.Mixed }]
        },
        views: { type: Number, default: 0 },
        title: { type: String, required: true },
        description: { type: String, required: true },
        tags: { type: [String], required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    {
        timestamps: true,
    }
);

questionSchema.post('save', async function (doc) {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(
        doc.author,
        { $push: { questions: doc._id } }
    );
});

export const QuestionModel = mongoose.model<QuestionDocument>(
    "Question",
    questionSchema
);
