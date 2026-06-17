import seedClassrooms from "./classroom.seed";
import seedCourses from "./course.seed";
import seedDepartments from "./department.seed";
import seedEmployees from "./employee.seed";
import seedExams from "./exam.seed";
import seedExamMarks from "./examMark.seed";
import seedExpenses from "./expense.seed";
import seedParents from "./parent.seed";
import seedPayments from "./payment.seed";
import seedRoutines from "./routine.seed";
import seedStudents from "./student.seed";
import seedTeachers from "./teacher.seed";
import seedUsers from "./user.seed";
import seedAttendances from "./attendance.seed";

const seedDatabase = async () => {
  console.log("🌱 Seeding database...");
  await seedUsers();
  await seedDepartments();
  await seedCourses();
  await seedClassrooms();
  await seedTeachers();
  await seedStudents();
  await seedParents();
  await seedEmployees();
  await seedExpenses();
  await seedRoutines();
  await seedExams();
  await seedExamMarks();
  await seedAttendances();
  await seedPayments();
  console.log("🌳 Database seeded successfully.");
};

export default seedDatabase;
