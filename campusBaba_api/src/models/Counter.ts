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

/**
 * Atomically increment the counter for `name` and return the new value.
 * Thread-safe via findOneAndUpdate with upsert.
 */
export async function nextSequence(name: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter!.seq;
}
