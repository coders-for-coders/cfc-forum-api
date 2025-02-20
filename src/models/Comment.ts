import mongoose, { Document, Schema } from "mongoose";

interface CommentDocuement extends Document {
    content: string;
    author: Schema.Types.ObjectId;
    post: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    likes: Schema.Types.ObjectId[];
    isDeleted: boolean;
    parentComment?: Schema.Types.ObjectId;
}

const CommentSchema = new Schema<CommentDocuement>({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' }
});


CommentSchema.post('save', async function (doc) {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(
        doc.author,
        { $push: { questions: doc._id } }
    );
});

export const CommentModel = mongoose.model<CommentDocuement>(
    "Comment",
    CommentSchema
);
