import { Request, Response } from "express";
import { Exam } from "../models/Exam";
import { ExamMark } from "../models/ExamMark";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  getPaginationParams,
  createPaginationResult,
} from "../utils/pagination";

export const createExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.create(req.body);

  res.status(201).json({
    success: true,
    message: "Exam created successfully",
    data: exam,
  });
});

export const getAllExams = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
  const { courseId, classRoomId, examType, status, startDate, endDate } =
    req.query;

  const filter: any = {};
  if (courseId) filter.courseId = courseId;
  if (classRoomId) filter.classRoomId = classRoomId;
  if (examType) filter.examType = examType;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate as string);
    if (endDate) filter.date.$lte = new Date(endDate as string);
  }

  const skip = (page - 1) * limit;
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [exams, total] = await Promise.all([
    Exam.find(filter)
      .populate("courseId", "name code")
      .populate("classRoomId", "name roomNumber")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Exam.countDocuments(filter),
  ]);

  const result = createPaginationResult(exams, total, page, limit);

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getExamById = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.findById(req.params.id)
    .populate("courseId", "name code credits")
    .populate("classRoomId", "name roomNumber departmentId");

  if (!exam) {
    throw new AppError(404, "Exam not found");
  }

  res.status(200).json({
    success: true,
    data: exam,
  });
});

export const getExamsByClassRoom = asyncHandler(
  async (req: Request, res: Response) => {
    const { classRoomId } = req.params;
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { examType, status, startDate, endDate } = req.query;

    const filter: any = { classRoomId };
    if (examType) filter.examType = examType;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [exams, total] = await Promise.all([
      Exam.find(filter)
        .populate("courseId", "name code")
        .populate("classRoomId", "name roomNumber")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Exam.countDocuments(filter),
    ]);

    const result = createPaginationResult(exams, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const updateExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!exam) {
    throw new AppError(404, "Exam not found");
  }

  res.status(200).json({
    success: true,
    message: "Exam updated successfully",
    data: exam,
  });
});

export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);

  if (!exam) {
    throw new AppError(404, "Exam not found");
  }

  res.status(200).json({
    success: true,
    message: "Exam deleted successfully",
  });
});

// Exam Marks
export const createExamMark = asyncHandler(
  async (req: Request, res: Response) => {
    const examMark = await ExamMark.create(req.body);

    res.status(201).json({
      success: true,
      message: "Exam mark created successfully",
      data: examMark,
    });
  },
);

export const getAllExamMarks = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { examId, studentId, status } = req.query;

    const filter: any = {};
    if (examId) filter.examId = examId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [examMarks, total] = await Promise.all([
      ExamMark.find(filter)
        .populate("examId", "name examType totalMarks passingMarks")
        .populate("studentId", "firstName lastName email")
        .populate("evaluatedBy", "firstName lastName")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      ExamMark.countDocuments(filter),
    ]);

    const result = createPaginationResult(examMarks, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getExamMarkById = asyncHandler(
  async (req: Request, res: Response) => {
    const examMark = await ExamMark.findById(req.params.id)
      .populate("examId", "name examType totalMarks passingMarks date")
      .populate("studentId", "firstName lastName email")
      .populate("evaluatedBy", "firstName lastName email");

    if (!examMark) {
      throw new AppError(404, "Exam mark not found");
    }

    res.status(200).json({
      success: true,
      data: examMark,
    });
  },
);

export const updateExamMark = asyncHandler(
  async (req: Request, res: Response) => {
    const examMark = await ExamMark.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!examMark) {
      throw new AppError(404, "Exam mark not found");
    }

    res.status(200).json({
      success: true,
      message: "Exam mark updated successfully",
      data: examMark,
    });
  },
);

export const deleteExamMark = asyncHandler(
  async (req: Request, res: Response) => {
    const examMark = await ExamMark.findByIdAndDelete(req.params.id);

    if (!examMark) {
      throw new AppError(404, "Exam mark not found");
    }

    res.status(200).json({
      success: true,
      message: "Exam mark deleted successfully",
    });
  },
);

export const getStudentExamResults = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId } = req.params;

    const results = await ExamMark.find({
      studentId,
      status: { $in: ["evaluated"] },
    })
      .populate("examId", "name examType totalMarks passingMarks date courseId")
      .populate({
        path: "examId",
        populate: {
          path: "courseId",
          select: "name code",
        },
      })
      .sort("-examId.date");

    res.status(200).json({
      success: true,
      data: results,
    });
  },
);

export const getExamMarksByClassRoom = asyncHandler(
  async (req: Request, res: Response) => {
    const { classRoomId } = req.params;
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { status } = req.query;

    // First, find all exams for this classroom
    const exams = await Exam.find({ classRoomId }).select("_id").lean();
    const examIds = exams.map((exam) => exam._id);

    // Build filter for exam marks
    const filter: any = { examId: { $in: examIds } };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [examMarks, total] = await Promise.all([
      ExamMark.find(filter)
        .populate("examId", "name examType totalMarks passingMarks date")
        .populate("studentId", "firstName lastName email studentId")
        .populate("evaluatedBy", "firstName lastName")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      ExamMark.countDocuments(filter),
    ]);

    const result = createPaginationResult(examMarks, total, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);
