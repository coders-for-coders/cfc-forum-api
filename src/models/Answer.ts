import mongoose, { Document, Schema } from "mongoose";

interface VoteType {
    up: number;
    down: number;
}

interface AnswerDocument extends Document {
    content: string;
    votes: VoteType;
    comments: mongoose.Types.ObjectId[]; 
    author: mongoose.Types.ObjectId;
    question: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AnswerSchema = new Schema<AnswerDocument>(
    {
        content: { type: String, required: true },
        votes: { 
            up: { type: Number, default: 0 },
            down: { type: Number, default: 0 }
        },
        comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }], 
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        question: { type: Schema.Types.ObjectId, ref: "QuestionProps", required: true },
    },
    {
        timestamps: true,
    }
);

AnswerSchema.post('save', async function(doc) {

    const User = mongoose.model('User');
    await User.findByIdAndUpdate(
        doc.author,
        { $push: { answers: doc._id } }
    );

    
    const Question = mongoose.model('Question');
    await Question.findByIdAndUpdate(
        doc.question,
        { 
            $push: { 'answers.answers': doc._id },
            $inc: { 'answers.count': 1 }
        }
    );
});


export const AnswerModel = mongoose.model<AnswerDocument>("Answer", AnswerSchema);
