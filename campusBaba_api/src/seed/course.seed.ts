import { faker } from "@faker-js/faker";
import { Course } from "../models";
import { Department } from "../models";

const seedCourses = async () => {
  try {
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      const departments = await Department.find();
      if (departments.length === 0) {
        console.log("⚠️ Please seed departments first.");
        return;
      }

      const courses = [];
      for (let i = 0; i < 10; i++) {
        const department = faker.helpers.arrayElement(departments);
        const course = new Course({
          name: faker.commerce.productName(),
          code: `${department.code}${faker.number.int({ min: 100, max: 499 })}`,
          description: faker.lorem.sentence(),
          departmentId: department._id,
          credits: faker.helpers.arrayElement([3, 4]),
          duration: faker.helpers.arrayElement([3, 4, 6]),
        });
        courses.push(course);
      }
      await Course.insertMany(courses);
      console.log("✅ 10 Courses seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
  }
};

export default seedCourses;
