import { Department } from "../models";

const seedDepartments = async () => {
  try {
    const count = await Department.countDocuments();
    if (count === 0) {
      const departments = [
        { name: "Computer Science", code: "CSE" },
        { name: "Electrical Engineering", code: "EEE" },
        { name: "Mechanical Engineering", code: "ME" },
        { name: "Civil Engineering", code: "CE" },
        { name: "Business Administration", code: "BBA" },
      ];
      await Department.insertMany(departments);
      console.log("✅ Departments seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding departments:", error);
  }
};

export default seedDepartments;
