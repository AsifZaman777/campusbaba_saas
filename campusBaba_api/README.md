# School Management System API

A comprehensive RESTful API for managing school operations including students, teachers, courses, attendance, exams, payments, and more.

## Features

### User Management
- **Students**: Complete CRUD operations with enrollment tracking
- **Parents**: Parent-student relationship management
- **Teachers**: Teacher profiles with department assignments
- **Employees**: Non-teaching staff management

### Academic Management
- **Departments**: Department hierarchy and management
- **Courses**: Course catalog with credits and duration
- **ClassRooms**: Class management with enrollment tracking
- **Attendance**: Daily attendance tracking with bulk operations
- **Routine**: Class scheduling with teacher assignments

### Exam Management
- **Exams**: Multiple exam types (midterm, final, quiz, etc.)
- **Exam Marks**: Grade management and student results

### Financial Management
- **Payments**: Student fee collection and tracking
- **Expenses**: Expense management with categories
- **Reports**: Income, expense, and profit/loss reports

### Communication
- **Notices**: Notice board with target audience filtering

### Dashboard
- Enrollment statistics
- Attendance ratios
- Payment tracking
- Today's schedule

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd schooler_api
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update `.env` with your configuration
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/schooler
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

5. Start MongoDB
```bash
# Using MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

6. Run the development server
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api/v1`

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Endpoints

#### Students
- `POST /students` - Create student
- `GET /students` - Get all students (with pagination)
- `GET /students/:id` - Get student by ID
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student
- `GET /students/stats` - Get student statistics

#### Parents
- `POST /parents` - Create parent
- `GET /parents` - Get all parents
- `GET /parents/:id` - Get parent by ID
- `GET /parents/:id/children` - Get parent's children
- `PUT /parents/:id` - Update parent
- `DELETE /parents/:id` - Delete parent

#### Teachers
- `POST /teachers` - Create teacher
- `GET /teachers` - Get all teachers
- `GET /teachers/:id` - Get teacher by ID
- `PUT /teachers/:id` - Update teacher
- `DELETE /teachers/:id` - Delete teacher
- `GET /teachers/stats` - Get teacher statistics

#### Departments
- `POST /departments` - Create department
- `GET /departments` - Get all departments
- `GET /departments/:id` - Get department by ID
- `PUT /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department

#### Courses
- `POST /courses` - Create course
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

#### ClassRooms
- `POST /classrooms` - Create classroom
- `GET /classrooms` - Get all classrooms
- `GET /classrooms/:id` - Get classroom by ID
- `GET /classrooms/:id/students` - Get classroom students
- `PUT /classrooms/:id` - Update classroom
- `DELETE /classrooms/:id` - Delete classroom

#### Attendance
- `POST /attendance` - Mark attendance
- `POST /attendance/bulk` - Bulk mark attendance
- `GET /attendance` - Get all attendance records
- `GET /attendance/classroom/:classRoomId` - Get classroom attendance
- `GET /attendance/stats` - Get attendance statistics

#### Routines
- `POST /routines` - Create routine
- `GET /routines` - Get all routines
- `GET /routines/classroom/:classRoomId` - Get classroom routine
- `GET /routines/teacher/:teacherId` - Get teacher routine
- `PUT /routines/:id` - Update routine
- `DELETE /routines/:id` - Delete routine

#### Exams
- `POST /exams` - Create exam
- `GET /exams` - Get all exams
- `POST /exams/marks` - Create exam mark
- `GET /exams/marks/student/:studentId` - Get student results

#### Payments
- `POST /payments` - Create payment
- `GET /payments` - Get all payments
- `GET /payments/student/:studentId` - Get student payments
- `GET /payments/stats` - Get payment statistics

#### Expenses
- `POST /expenses` - Create expense
- `GET /expenses` - Get all expenses
- `GET /expenses/stats` - Get expense statistics

#### Notices
- `POST /notices` - Create notice
- `GET /notices` - Get all notices
- `GET /notices/active` - Get active notices

#### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/student-enrollment-ratio` - Get enrollment data
- `GET /dashboard/active-student-ratio` - Get active student ratio
- `GET /dashboard/attendance-ratio` - Get attendance ratio
- `GET /dashboard/payment-table` - Get payment table

#### Reports
- `GET /reports/income` - Get income report
- `GET /reports/expense` - Get expense report
- `GET /reports/business-projection` - Get business projection
- `GET /reports/profit-loss` - Get profit/loss report

## Query Parameters

Most list endpoints support the following query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Field to sort by (default: createdAt)
- `sortOrder` - Sort order: asc or desc (default: desc)
- `search` - Search term
- `status` - Filter by status

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
schooler_api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── validators/      # Zod validation schemas
│   ├── app.ts           # Express app setup
│   ├── routers.ts       # Route aggregation
│   └── server.ts        # Server entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC
