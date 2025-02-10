import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
    email: string;
    username: string;
    password: string;
    fullname: string;
    avatar: string;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
}


const userSchema = new Schema<UserDocument>(
    {
        email: { type: String, required: true },
        username: { type: String, required: true },
        fullname: { type: String, required: true },
        password: { type: String, required: true },
        avatar: { type: String, default: '' },
        bio: { type: String, default: '' },
    },
    { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);