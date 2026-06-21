import { Request, Response } from "express";
import { SuperAdmin } from "../masterModels/SuperAdmin";
import { Tenant } from "../masterModels/Tenant";
import { GlobalNotice } from "../masterModels/GlobalNotice";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import mongoose from "mongoose";
import TenantConnectionManager from "../utils/TenantConnectionManager";
import * as schemas from "../models";

// Super Admin Login
export const loginSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const admin = await SuperAdmin.findOne({ email });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: "Account is disabled" });
    }

    const token = jwt.sign({ id: admin._id, role: "superadmin" }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    res.status(200).json({
      success: true,
      token,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Provision new Tenant
export const provisionTenant = async (req: Request, res: Response) => {
  try {
    const { name, subdomain, billingPlan, maxStudents, maxTeachers, adminEmail, adminPassword } = req.body;

    if (!name || !subdomain || !adminEmail || !adminPassword) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if subdomain exists
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(400).json({ success: false, message: "Subdomain already in use" });
    }

    // Determine DB URI
    // Use MONGODB_URI from env (which is what database.ts uses)
    const defaultUri = env.MONGODB_URI;
    const uriObj = new URL(defaultUri);
    const dbPathParts = uriObj.pathname.split('/');
    dbPathParts[dbPathParts.length - 1] = `tenant_${subdomain}`;
    uriObj.pathname = dbPathParts.join('/');
    const tenantDbURI = uriObj.toString();

    // Create Tenant Record
    const tenant = await Tenant.create({
      name,
      subdomain,
      dbURI: tenantDbURI,
      billingPlan: billingPlan || "postpaid",
      maxStudents: maxStudents || 100,
      maxTeachers: maxTeachers || 10,
    });

    // Initialize Tenant DB and create first Admin
    const tenantConn = TenantConnectionManager.getTenantConnection(subdomain, tenantDbURI);
    
    // Using schema directly to create the initial admin employee and user
    const EmployeeModel = TenantConnectionManager.getTenantModel<any>(tenantConn, "Employee");
    const UserModel = TenantConnectionManager.getTenantModel<any>(tenantConn, "User");

    const newEmployee = await EmployeeModel.create({
      employeeId: `ADM-${Date.now()}`,
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      phone: "00000000000",
      dateOfBirth: new Date("1980-01-01"),
      gender: "other",
      address: {
        street: "123 Main St",
        city: "Metropolis",
        state: "State",
        zipCode: "00000",
        country: "Country",
      },
      position: "Principal",
      department: "Administration",
      joiningDate: new Date(),
      salary: 0,
      status: "active",
      emergencyContact: {
        name: "Emergency Contact",
        relationship: "Other",
        phone: "00000000000",
      },
    });

    await UserModel.create({
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      referenceId: newEmployee._id
    });

    res.status(201).json({
      success: true,
      message: "Tenant provisioned successfully",
      data: {
        tenant,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: "Provisioning failed", error: error.message });
  }
};

// Get all Tenants
export const getTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch tenants" });
  }
};

// Get specific Tenant details (Deep Info)
export const getTenantDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id);

    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // Connect to specific tenant's database
    const tenantConn = TenantConnectionManager.getTenantConnection(tenant.subdomain, tenant.dbURI);
    
    // Get Models
    const StudentModel = TenantConnectionManager.getTenantModel<any>(tenantConn, "Student");
    const TeacherModel = TenantConnectionManager.getTenantModel<any>(tenantConn, "Teacher");
    const EmployeeModel = TenantConnectionManager.getTenantModel<any>(tenantConn, "Employee");

    // Fetch deep information
    const students = await StudentModel.find().lean();
    const teachers = await TeacherModel.find().lean();
    const employees = await EmployeeModel.find().lean();

    res.status(200).json({
      success: true,
      data: {
        tenant,
        analytics: {
          currentStudents: students.length,
          currentTeachers: teachers.length,
          currentEmployees: employees.length,
        },
        lists: {
          students,
          teachers,
          employees
        }
      },
    });
  } catch (error: any) {
    console.error("Deep fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch deep tenant info", error: error.message });
  }
};

// Update Tenant
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subscriptionStatus, maxStudents, maxTeachers, maxAdmins, billingPlan } = req.body;

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    if (subscriptionStatus) tenant.subscriptionStatus = subscriptionStatus;
    if (maxStudents !== undefined) tenant.maxStudents = maxStudents;
    if (maxTeachers !== undefined) tenant.maxTeachers = maxTeachers;
    if (maxAdmins !== undefined) tenant.maxAdmins = maxAdmins;
    if (billingPlan) tenant.billingPlan = billingPlan;

    await tenant.save();

    res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update tenant" });
  }
};

// ─── NEW: Dashboard Stats ───────────────────────────
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const tenants = await Tenant.find().lean();

    let totalStudents = 0;
    let totalTeachers = 0;
    let totalEmployees = 0;

    // Aggregate counts across all tenant databases
    for (const tenant of tenants) {
      try {
        const tenantConn = TenantConnectionManager.getTenantConnection(tenant.subdomain, tenant.dbURI);
        const StudentModel = TenantConnectionManager.getTenantModel<any>(tenantConn, "Student");
        const TeacherModel = TenantConnectionManager.getTenantModel<any>(tenantConn, "Teacher");
        const EmployeeModel = TenantConnectionManager.getTenantModel<any>(tenantConn, "Employee");

        const [studentCount, teacherCount, employeeCount] = await Promise.all([
          StudentModel.countDocuments(),
          TeacherModel.countDocuments(),
          EmployeeModel.countDocuments(),
        ]);

        totalStudents += studentCount;
        totalTeachers += teacherCount;
        totalEmployees += employeeCount;
      } catch (err) {
        // Skip if tenant DB is unreachable
        console.warn(`Could not fetch stats for tenant ${tenant.subdomain}:`, err);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalOrganizations: tenants.length,
        activeOrganizations: tenants.filter(t => t.subscriptionStatus === "active").length,
        inactiveOrganizations: tenants.filter(t => t.subscriptionStatus !== "active").length,
        totalStudents,
        totalTeachers,
        totalEmployees,
        totalSubdomains: tenants.filter(t => t.subdomain).length,
      },
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

// ─── NEW: Suspend Tenant ────────────────────────────
export const suspendTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    tenant.subscriptionStatus = "inactive";
    await tenant.save();

    res.status(200).json({
      success: true,
      message: "Tenant suspended successfully",
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to suspend tenant" });
  }
};

// ─── NEW: Activate Tenant ───────────────────────────
export const activateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    tenant.subscriptionStatus = "active";
    await tenant.save();

    res.status(200).json({
      success: true,
      message: "Tenant activated successfully",
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to activate tenant" });
  }
};

// ─── NEW: Delete Tenant ─────────────────────────────
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    await Tenant.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete tenant" });
  }
};

// ─── NEW: Global Notices CRUD ───────────────────────
export const createGlobalNotice = async (req: Request, res: Response) => {
  try {
    const notice = await GlobalNotice.create(req.body);
    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: notice,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to create notice", error: error.message });
  }
};

export const getGlobalNotices = async (req: Request, res: Response) => {
  try {
    const notices = await GlobalNotice.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notices" });
  }
};

export const updateGlobalNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notice = await GlobalNotice.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      data: notice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notice" });
  }
};

export const deleteGlobalNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notice = await GlobalNotice.findByIdAndDelete(id);

    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete notice" });
  }
};
