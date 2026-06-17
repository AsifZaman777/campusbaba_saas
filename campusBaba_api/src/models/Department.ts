import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    code: string;
    description?: string;
    headOfDepartment?: mongoose.Types.ObjectId;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            required: [true, 'Department name is required'],
            trim: true,
            unique: true,
        },
        code: {
            type: String,
            required: [true, 'Department code is required'],
            trim: true,
            unique: true,
            uppercase: true,
        },
        description: {
            type: String,
            trim: true,
        },
        headOfDepartment: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
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

departmentSchema.index({ code: 1 });
departmentSchema.index({ status: 1 });

export { departmentSchema };
