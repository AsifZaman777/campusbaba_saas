import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Teacher } from "../models/Teacher";
import { Student } from "../models/Student";
import { Parent } from "../models/Parent";
import { Employee } from "../models/Employee";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, "Please provide email and password");
  }

  // Find user
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new AppError(403, "Your account has been deactivated");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Get user details based on role
  let userData: any = null;
  let modelName = "";

  switch (user.role) {
    case "teacher":
      userData = await Teacher.findById(user.referenceId);
      modelName = "Teacher";
      break;
    case "student":
      userData = await Student.findById(user.referenceId);
      modelName = "Student";
      break;
    case "parent":
      userData = await Parent.findById(user.referenceId);
      modelName = "Parent";
      break;
    case "employee":
      userData = await Employee.findById(user.referenceId);
      modelName = "Employee";
      break;
    case "admin":
      userData = await Employee.findById(user.referenceId);
      modelName = "Employee";
      break;
  }

  if (!userData) {
    throw new AppError(404, `${modelName} profile not found`);
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      referenceId: user.referenceId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        referenceId: user.referenceId,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          profileImage: userData.profileImage,
          ...((user.role === "teacher" ||
            user.role === "employee" ||
            user.role === "admin") && {
            department: userData.department || userData.departmentId,
          }),
          ...(user.role === "student" && {
            classRoomId: userData.classRoomId,
            status: userData.status,
          }),
        },
      },
    },
  });
});

// Register (for creating new users)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role, referenceId } = req.body;

  if (!email || !password || !role || !referenceId) {
    throw new AppError(400, "Please provide all required fields");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(400, "User with this email already exists");
  }

  // Verify reference exists based on role
  let referenceExists = false;
  switch (role) {
    case "teacher":
      referenceExists = !!(await Teacher.findById(referenceId));
      break;
    case "student":
      referenceExists = !!(await Student.findById(referenceId));
      break;
    case "parent":
      referenceExists = !!(await Parent.findById(referenceId));
      break;
    case "employee":
    case "admin":
      referenceExists = !!(await Employee.findById(referenceId));
      break;
  }

  if (!referenceExists) {
    throw new AppError(404, `${role} profile not found`);
  }

  // Create user
  const user = await User.create({
    email,
    password,
    role,
    referenceId,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

// Get current user
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError(401, "No token provided");
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new AppError(401, "User not found or inactive");
      }

      // Get user details based on role
      let userData: any = null;

      switch (user.role) {
        case "teacher":
          userData = await Teacher.findById(user.referenceId);
          break;
        case "student":
          userData = await Student.findById(user.referenceId);
          break;
        case "parent":
          userData = await Parent.findById(user.referenceId);
          break;
        case "employee":
        case "admin":
          userData = await Employee.findById(user.referenceId);
          break;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: userData
            ? {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                profileImage: userData.profileImage,
              }
            : null,
        },
      });
    } catch (error) {
      throw new AppError(401, "Invalid or expired token");
    }
  },
);

// Change password
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError(401, "No token provided");
    }

    if (!currentPassword || !newPassword) {
      throw new AppError(400, "Please provide current and new password");
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError(401, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  },
);
