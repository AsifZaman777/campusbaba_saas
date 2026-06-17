import { faker } from "@faker-js/faker";
import { Routine } from "../models";
import { ClassRoom, Teacher } from "../models";

const seedRoutines = async () => {
  try {
    const routineCount = await Routine.countDocuments();
    if (routineCount === 0) {
      const classrooms = await ClassRoom.find().populate("courseId");
      const teachers = await Teacher.find();

      if (classrooms.length === 0 || teachers.length === 0) {
        console.log("⚠️ Please seed classrooms and teachers first.");
        return;
      }

      const routines = [];
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
      const times = ["09:00", "10:00", "11:00", "13:00", "14:00"];

      for (const classroom of classrooms) {
        for (const day of days) {
          for (const time of times) {
            const teacher = teachers.find(
              (t) =>
                t.departmentId && t.departmentId.equals(classroom.departmentId),
            );
            if (!teacher) continue;

            const routine = new Routine({
              classRoomId: classroom._id,
              teacherId: teacher._id,
              dayOfWeek: day,
              startTime: time,
              endTime: `${parseInt(time.split(":")[0]) + 1}:00`,
              subject: (classroom.courseId as any).name,
              roomNumber: classroom.roomNumber,
            });
            routines.push(routine);
          }
        }
      }
      await Routine.insertMany(routines);
      console.log("✅ Routines seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding routines:", error);
  }
};

export default seedRoutines;
