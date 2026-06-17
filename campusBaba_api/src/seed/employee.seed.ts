import { faker } from "@faker-js/faker";
import { Employee, User } from "../models";

const seedEmployees = async () => {
  try {
    const employeeCount = await Employee.countDocuments();
    if (employeeCount === 0) {
      const employees = [];
      for (let i = 0; i < 10; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet
          .email({ firstName, lastName })
          .toLowerCase();

        const employee = new Employee({
          firstName,
          lastName,
          email,
          phone: faker.phone.number(),
          dateOfBirth: faker.date.birthdate({ min: 22, max: 55, mode: "age" }),
          gender: faker.helpers.arrayElement(["male", "female"]),
          address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country(),
          },
          position: faker.person.jobTitle(),
          department: faker.commerce.department(),
          joiningDate: faker.date.past({ years: 5 }),
          salary: faker.number.int({ min: 30000, max: 90000 }),
          status: "active",
          emergencyContact: {
            name: faker.person.fullName(),
            relationship: "Spouse",
            phone: faker.phone.number(),
          },
        });

        const user = new User({
          email,
          password: "password123",
          role: "employee",
          referenceId: employee._id,
        });

        employees.push(employee.save());
        employees.push(user.save());
      }
      await Promise.all(employees);
      console.log("✅ 10 Employees seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding employees:", error);
  }
};

export default seedEmployees;
