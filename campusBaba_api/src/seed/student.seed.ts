import { faker } from "@faker-js/faker";
import { Student, User } from "../models";
import { Department } from "../models";
import { ClassRoom } from "../models";

const seedStudents = async () => {
  try {
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      const departments = await Department.find();
      const classRooms = await ClassRoom.find();

      if (departments.length === 0 || classRooms.length === 0) {
        console.log("⚠️ Please seed departments and classrooms first.");
        return;
      }

      const students = [];
      for (let i = 0; i < 20; i++) {
        const studentId = `STU-${faker.string.alphanumeric(6).toUpperCase()}`;
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet
          .email({ firstName, lastName })
          .toLowerCase();
        const department = faker.helpers.arrayElement(departments);
        const classRoom = faker.helpers.arrayElement(
          classRooms.filter((c) => c.departmentId.equals(department._id)),
        );

        if (!classRoom) continue;

        const student = new Student({
          studentId,
          firstName,
          lastName,
          email,
          phone: faker.phone.number(),
          dateOfBirth: faker.date.birthdate({ min: 18, max: 25, mode: "age" }),
          gender: faker.helpers.arrayElement(["male", "female"]),
          address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country(),
          },
          enrollmentDate: faker.date.past({ years: 4 }),
          status: "active",
          departmentId: department._id,
          classRoomId: classRoom._id,
          emergencyContact: {
            name: faker.person.fullName(),
            relationship: faker.helpers.arrayElement([
              "Father",
              "Mother",
              "Guardian",
            ]),
            phone: faker.phone.number(),
          },
        });

        const user = new User({
          email,
          password: "password123",
          role: "student",
          referenceId: student._id,
        });

        students.push(student.save());
        students.push(user.save());
      }
      await Promise.all(students);
      console.log("✅ 20 Students seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding students:", error);
  }
};

export default seedStudents;
