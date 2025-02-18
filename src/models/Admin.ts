import mongoose, { Document, Schema } from 'mongoose';

export interface AdminDocument extends Document {
    email: string;
    username: string;
    password: string;
    fullname: string;
    createdAt: Date;
    updatedAt: Date;
}

const adminSchema = new Schema<AdminDocument>(
    {
        email: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        fullname: { type: String, required: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

export const AdminModel = mongoose.model<AdminDocument>('Admin', adminSchema);