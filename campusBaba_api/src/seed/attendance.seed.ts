import { faker } from "@faker-js/faker";
import { Attendance } from "../models";
import { Student, ClassRoom, Teacher } from "../models";

const seedAttendances = async () => {
  try {
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0) {
      const students = await Student.find();
      const classrooms = await ClassRoom.find();
      const teachers = await Teacher.find();

      if (
        students.length === 0 ||
        classrooms.length === 0 ||
        teachers.length === 0
      ) {
        console.log("⚠️ Please seed students, classrooms, and teachers first.");
        return;
      }

      const attendances = [];
      const dates = Array.from({ length: 10 }, () =>
        faker.date.past({ years: 1 }),
      );

      for (const student of students) {
        if (!student.classRoomId) continue;

        const classroom = classrooms.find((c) =>
          c._id.equals(student.classRoomId),
        );
        if (!classroom) continue;

        const teacher = teachers.find(
          (t) =>
            t.departmentId && t.departmentId.equals(classroom.departmentId),
        );
        if (!teacher) continue;

        for (const date of dates) {
          const attendance = new Attendance({
            studentId: student._id,
            classRoomId: classroom._id,
            date,
            status: faker.helpers.arrayElement(["present", "absent", "late"]),
            markedBy: teacher._id,
          });
          attendances.push(attendance);
        }
      }
      await Attendance.insertMany(attendances);
      console.log("✅ Attendances seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding attendances:", error);
  }
};

export default seedAttendances;
