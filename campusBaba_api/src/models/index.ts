import mongoose from "mongoose";
import { tenantContext } from "../utils/asyncLocalStorage";
import TenantConnectionManager from "../utils/TenantConnectionManager";

export { counterSchema } from "./Counter";
export { attendanceSchema, IAttendance } from "./Attendance";
export { classRoomSchema, IClassRoom } from "./ClassRoom";
export { courseSchema, ICourse } from "./Course";
export { departmentSchema, IDepartment } from "./Department";
export { employeeSchema, IEmployee } from "./Employee";
export { examSchema, IExam } from "./Exam";
export { examMarkSchema, IExamMark } from "./ExamMark";
export { expenseSchema, IExpense } from "./Expense";
export { noticeSchema, INotice } from "./Notice";
export { parentSchema, IParent } from "./Parent";
export { paymentSchema, IPayment } from "./Payment";
export { routineSchema, IRoutine } from "./Routine";
export { studentSchema, IStudent } from "./Student";
export { teacherSchema, ITeacher } from "./Teacher";
export { userSchema, IUser } from "./User";

function createModelProxy<T>(modelName: string): mongoose.Model<T> {
  return new Proxy({}, {
    get(target, prop) {
      const connection = tenantContext.getStore();
      if (!connection) {
        throw new Error(`Tenant context not found for model ${modelName}. Make sure the request passed through tenantResolver.`);
      }
      
      const Model = TenantConnectionManager.getTenantModel<T>(connection, modelName) as any;
      
      const property = Model[prop];
      if (typeof property === 'function') {
        return property.bind(Model);
      }
      return property;
    }
  }) as mongoose.Model<T>;
}

export const Counter = createModelProxy<any>("Counter");
export const Attendance = createModelProxy<any>("Attendance");
export const ClassRoom = createModelProxy<any>("ClassRoom");
export const Course = createModelProxy<any>("Course");
export const Department = createModelProxy<any>("Department");
export const Employee = createModelProxy<any>("Employee");
export const Exam = createModelProxy<any>("Exam");
export const ExamMark = createModelProxy<any>("ExamMark");
export const Expense = createModelProxy<any>("Expense");
export const Notice = createModelProxy<any>("Notice");
export const Parent = createModelProxy<any>("Parent");
export const Payment = createModelProxy<any>("Payment");
export const Routine = createModelProxy<any>("Routine");
export const Student = createModelProxy<any>("Student");
export const Teacher = createModelProxy<any>("Teacher");
export const User = createModelProxy<any>("User");

export async function nextSequence(name: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}
