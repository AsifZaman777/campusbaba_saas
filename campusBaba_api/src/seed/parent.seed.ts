import { faker } from "@faker-js/faker";
import { Parent, User, Student } from "../models";

const seedParents = async () => {
  try {
    const parentCount = await Parent.countDocuments();
    if (parentCount === 0) {
      const students = await Student.find().limit(10);
      if (students.length === 0) {
        console.log("⚠️ Please seed students first.");
        return;
      }

      const parents = [];
      for (const student of students) {
        const parentId = `PRT-${faker.string.alphanumeric(6).toUpperCase()}`;
        const firstName = faker.person.firstName();
        const lastName = student.lastName;
        const email = faker.internet
          .email({ firstName, lastName })
          .toLowerCase();

        const parent = new Parent({
          parentId,
          firstName,
          lastName,
          email,
          phone: faker.phone.number(),
          occupation: faker.person.jobTitle(),
          address: student.address,
          relationship: faker.helpers.arrayElement(["father", "mother"]),
        });

        student.parentId = parent._id;
        await student.save();

        const user = new User({
          email,
          password: "password123",
          role: "parent",
          referenceId: parent._id,
        });

        parents.push(parent.save());
        parents.push(user.save());
      }
      await Promise.all(parents);
      console.log("✅ 10 Parents seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding parents:", error);
  }
};

export default seedParents;
