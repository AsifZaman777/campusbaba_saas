import { faker } from "@faker-js/faker";
import { Expense } from "../models";
import { Employee } from "../models";

const seedExpenses = async () => {
  try {
    const expenseCount = await Expense.countDocuments();
    if (expenseCount === 0) {
      const employees = await Employee.find({ position: "Accountant" });
      const admin = await Employee.findOne({ department: "Administration" });

      const expenses = [];
      for (let i = 0; i < 30; i++) {
        const category = faker.helpers.arrayElement([
          "salary",
          "fixed",
          "other",
        ]);
        const expense = new Expense({
          category,
          subcategory: faker.commerce.department(),
          amount: faker.number.int({ min: 1000, max: 50000 }),
          description: faker.lorem.sentence(),
          date: faker.date.past({ years: 1 }),
          paymentMethod: faker.helpers.arrayElement([
            "cash",
            "card",
            "bank-transfer",
          ]),
          employeeId:
            category === "salary"
              ? faker.helpers.arrayElement(employees)?._id
              : undefined,
          approvedBy: admin?._id,
          status: faker.helpers.arrayElement(["pending", "approved", "paid"]),
        });
        expenses.push(expense);
      }
      await Expense.insertMany(expenses);
      console.log("✅ 30 Expenses seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding expenses:", error);
  }
};

export default seedExpenses;
