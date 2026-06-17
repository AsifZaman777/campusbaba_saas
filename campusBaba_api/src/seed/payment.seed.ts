import { faker } from "@faker-js/faker";
import { Payment, Student, Course, ClassRoom, Counter } from "../models";
import { nextSequence } from "../models/Counter";

const seedPayments = async () => {
  try {
    // Always remove old payments so the seed is idempotent and re-runnable
    await Payment.deleteMany({});
    // Reset the payment counter so PAY-0001 starts again
    await Counter.findByIdAndUpdate(
      "payment",
      { $set: { seq: 0 } },
      { upsert: true },
    );

    const students = await Student.find();
    const courses = await Course.find();
    const classRooms = await ClassRoom.find();

    if (
      students.length === 0 ||
      courses.length === 0 ||
      classRooms.length === 0
    ) {
      console.log("⚠️ Please seed students, courses, and classrooms first.");
      return;
    }

    const courseById = new Map(
      courses.map((course) => [course._id.toString(), course]),
    );
    const classRoomById = new Map(
      classRooms.map((classRoom) => [classRoom._id.toString(), classRoom]),
    );

    const payments = [];
    for (const student of students) {
      if (!student.classRoomId) continue;

      const classRoom = classRoomById.get(student.classRoomId.toString());
      if (!classRoom) continue;

      const course = courseById.get(classRoom.courseId.toString());
      if (!course) continue;

      for (let i = 0; i < 2; i++) {
        // Two payments per student
        const seq = await nextSequence("payment");
        const paymentId = `PAY-${String(seq).padStart(4, "0")}`;

        const payment = new Payment({
          paymentId,
          studentId: student._id,
          courseId: course._id,
          amount: faker.number.int({ min: 5000, max: 20000 }),
          paymentType: faker.helpers.arrayElement(["tuition", "exam"]),
          paymentMethod: "online",
          transactionId: `TXN-${faker.string.alphanumeric(10).toUpperCase()}`,
          dueDate: faker.date.past({ years: 1 }),
          paidDate: faker.date.recent(),
          paymentStatus: faker.helpers.arrayElement([
            "paid",
            "pending",
            "overdue",
          ]),
          academicYear: "2023-2024",
          semester: faker.helpers.arrayElement(["Fall", "Spring"]),
        });
        payments.push(payment);
      }
    }
    await Payment.insertMany(payments);
    console.log(`✅ ${payments.length} Payments re-seeded (with paymentId + studentId)`);
  } catch (error) {
    console.error("❌ Error seeding payments:", error);
  }
};

export default seedPayments;
