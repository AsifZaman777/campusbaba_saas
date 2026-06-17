import mongoose, { Connection } from "mongoose";
import * as schemas from "../models";

class TenantConnectionManager {
  private static masterConnection: Connection | null = null;
  private static tenantConnections: { [key: string]: Connection } = {};

  static getMasterConnection(uri: string): Connection {
    if (!this.masterConnection) {
      this.masterConnection = mongoose.createConnection(uri);
    }
    return this.masterConnection;
  }

  static getTenantConnection(tenantId: string, uri: string): Connection {
    if (this.tenantConnections[tenantId]) {
      return this.tenantConnections[tenantId];
    }

    const conn = mongoose.createConnection(uri);
    
    // Register all tenant models
    conn.model("Counter", schemas.counterSchema);
    conn.model("Attendance", schemas.attendanceSchema);
    conn.model("ClassRoom", schemas.classRoomSchema);
    conn.model("Course", schemas.courseSchema);
    conn.model("Department", schemas.departmentSchema);
    conn.model("Employee", schemas.employeeSchema);
    conn.model("Exam", schemas.examSchema);
    conn.model("ExamMark", schemas.examMarkSchema);
    conn.model("Expense", schemas.expenseSchema);
    conn.model("Notice", schemas.noticeSchema);
    conn.model("Parent", schemas.parentSchema);
    conn.model("Payment", schemas.paymentSchema);
    conn.model("Routine", schemas.routineSchema);
    conn.model("Student", schemas.studentSchema);
    conn.model("Teacher", schemas.teacherSchema);
    conn.model("User", schemas.userSchema);

    this.tenantConnections[tenantId] = conn;
    return conn;
  }

  static getTenantModel<T>(connection: Connection, modelName: string): mongoose.Model<T> {
    return connection.model<T>(modelName);
  }
}

export default TenantConnectionManager;
