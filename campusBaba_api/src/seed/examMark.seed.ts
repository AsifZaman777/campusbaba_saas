import { faker } from "@faker-js/faker";
import { ExamMark } from "../models";
import { Exam, Student, Teacher } from "../models";

const seedExamMarks = async () => {
  try {
    const examMarkCount = await ExamMark.countDocuments();
    if (examMarkCount === 0) {
      const exams = await Exam.find();
      const students = await Student.find();
      const teachers = await Teacher.find();

      if (
        exams.length === 0 ||
        students.length === 0 ||
        teachers.length === 0
      ) {
        console.log("⚠️ Please seed exams, students, and teachers first.");
        return;
      }

      const examMarks = [];
      for (const exam of exams) {
        const classroomStudents = students.filter(
          (s) => s.classRoomId && s.classRoomId.equals(exam.classRoomId),
        );
        for (const student of classroomStudents) {
          const teacher = faker.helpers.arrayElement(teachers);
          const examMark = new ExamMark({
            examId: exam._id,
            studentId: student._id,
            marksObtained: faker.number.int({ min: 20, max: 100 }),
            evaluatedBy: teacher._id,
            status: "published",
          });
          examMarks.push(examMark);
        }
      }
      await ExamMark.insertMany(examMarks);
      console.log("✅ Exam Marks seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding exam marks:", error);
  }
};

export default seedExamMarks;
