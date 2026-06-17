import { faker } from '@faker-js/faker';
import { ClassRoom } from '../models';
import { Department, Course } from '../models';

const seedClassrooms = async () => {
  try {
    const classRoomCount = await ClassRoom.countDocuments();
    if (classRoomCount === 0) {
      const departments = await Department.find();
      const courses = await Course.find();

      if (departments.length === 0 || courses.length === 0) {
        console.log('⚠️ Please seed departments and courses first.');
        return;
      }

      const classrooms = [];
      for (let i = 0; i < 15; i++) {
        const department = faker.helpers.arrayElement(departments);
        const course = faker.helpers.arrayElement(courses.filter(c => c.departmentId.equals(department._id)));

        if (!course) continue;

        const classroom = new ClassRoom({
          classRoomId: `CR-${faker.string.alphanumeric(4).toUpperCase()}`,
          name: `${course.name} - Section ${faker.helpers.arrayElement(['A', 'B'])}`,
          roomNumber: faker.number.int({ min: 101, max: 599 }).toString(),
          departmentId: department._id,
          courseId: course._id,
          capacity: faker.number.int({ min: 30, max: 60 }),
          academicYear: '2024-2025',
          semester: faker.helpers.arrayElement(['Fall', 'Spring']),
        });
        classrooms.push(classroom);
      }
      await ClassRoom.insertMany(classrooms);
      console.log('✅ 15 Classrooms seeded');
    }
  } catch (error) {
    console.error('❌ Error seeding classrooms:', error);
  }
};

export default seedClassrooms;
