import { faker } from "@faker-js/faker";
import { Teacher, User } from "../models";
import { Department } from "../models";

const seedTeachers = async () => {
  try {
    const teacherCount = await Teacher.countDocuments();
    if (teacherCount === 0) {
      const departments = await Department.find();
      if (departments.length === 0) {
        console.log("⚠️ Please seed departments first.");
        return;
      }

      const teachers = [];
      for (let i = 0; i < 20; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet
          .email({ firstName, lastName })
          .toLowerCase();
        const department = faker.helpers.arrayElement(departments);

        const teacher = new Teacher({
          teacherId: `TCH-${faker.string.alphanumeric(6).toUpperCase()}`,
          firstName,
          lastName,
          email,
          phone: faker.phone.number(),
          dateOfBirth: faker.date.birthdate({ min: 28, max: 60, mode: "age" }),
          gender: faker.helpers.arrayElement(["male", "female"]),
          address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country(),
          },
          qualification: faker.helpers.arrayElement(["B.Sc", "M.Sc", "Ph.D"]),
          specialization: [faker.commerce.department()],
          experience: faker.number.int({ min: 2, max: 20 }),
          joiningDate: faker.date.past({ years: 10 }),
          salary: faker.number.int({ min: 40000, max: 120000 }),
          status: "active",
          departmentId: department._id,
          emergencyContact: {
            name: faker.person.fullName(),
            relationship: "Spouse",
            phone: faker.phone.number(),
          },
        });

        const user = new User({
          email,
          password: "password123",
          role: "teacher",
          referenceId: teacher._id,
        });

        teachers.push(teacher.save());
        teachers.push(user.save());
      }
      await Promise.all(teachers);
      console.log("✅ 20 Teachers seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding teachers:", error);
  }
};

export default seedTeachers;
