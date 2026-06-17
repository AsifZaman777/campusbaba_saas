import mongoose, { Schema } from "mongoose";

interface ICounter {
  _id: string; // e.g. "student", "teacher", "parent", "employee"
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export { counterSchema };


