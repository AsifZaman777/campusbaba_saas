import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    name: string;
    code: string;
    description?: string;
    departmentId: mongoose.Types.ObjectId;
    credits: number;
    duration: number; // in months
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
    {
        name: {
            type: String,
            required: [true, 'Course name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Course code is required'],
            trim: true,
            unique: true,
            uppercase: true,
        },
        description: {
            type: String,
            trim: true,
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Department',
            required: [true, 'Department is required'],
        },
        credits: {
            type: Number,
            required: [true, 'Credits are required'],
            min: [1, 'Credits must be at least 1'],
        },
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [1, 'Duration must be at least 1 month'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

courseSchema.index({ code: 1 });
courseSchema.index({ departmentId: 1 });
courseSchema.index({ status: 1 });

export { courseSchema };
