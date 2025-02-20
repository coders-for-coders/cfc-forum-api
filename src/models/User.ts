import mongoose, { Schema, Document, model } from 'mongoose';

interface UserDocument extends Document {
    email?: string;
    username?: string;
    password?: string;
    fullname?: string;

    githubId?: string;
    githubAccessToken?: string;
    githubRefreshToken?: string;

    discordId?: string;
    discordAccessToken?: string;
    discordRefreshToken?: string;

    avatar?: string;
    bio?: string;
    reputation?: number;

    questions: mongoose.Types.ObjectId[];
    answers: mongoose.Types.ObjectId[];
    comments: mongoose.Types.ObjectId[];

    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<UserDocument>(
    {
        email: { type: String },
        username: { type: String },
        fullname: { type: String },

        password: { type: String },

        githubId: { type: String },
        githubAccessToken: { type: String },
        githubRefreshToken: { type: String },
        discordId: { type: String },
        discordAccessToken: { type: String },
        discordRefreshToken: { type: String },

        avatar: { type: String, default: '' },
        bio: { type: String, default: '' },
        reputation: { type: Number, default: 0},

        questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
        answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
        comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
    },
    { timestamps: true }
);

const UserModel = model<UserDocument>('User', userSchema);

export { UserModel, UserDocument };
