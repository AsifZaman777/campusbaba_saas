import { faker } from "@faker-js/faker";
import { Exam } from "../models";
import { Course, ClassRoom } from "../models";

const seedExams = async () => {
  try {
    const examCount = await Exam.countDocuments();
    if (examCount === 0) {
      const courses = await Course.find();
      const classrooms = await ClassRoom.find();

      if (courses.length === 0 || classrooms.length === 0) {
        console.log("⚠️ Please seed courses and classrooms first.");
        return;
      }

      const exams = [];
      for (let i = 0; i < 20; i++) {
        const course = faker.helpers.arrayElement(courses);
        const classroom = faker.helpers.arrayElement(
          classrooms.filter((c) => c.courseId.equals(course._id)),
        );

        if (!classroom) continue;

        const exam = new Exam({
          examId: `EXM-${faker.string.alphanumeric(6).toUpperCase()}`,
          name: `${course.name} ${faker.helpers.arrayElement(["Midterm", "Final"])}`,
          examType: faker.helpers.arrayElement(["midterm", "final"]),
          courseId: course._id,
          classRoomId: classroom._id,
          date: faker.date.future({ years: 0.5 }),
          startTime: "10:00",
          endTime: "12:00",
          totalMarks: 100,
          passingMarks: 40,
        });
        exams.push(exam);
      }
      await Exam.insertMany(exams);
      console.log("✅ 20 Exams seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding exams:", error);
  }
};

export default seedExams;
