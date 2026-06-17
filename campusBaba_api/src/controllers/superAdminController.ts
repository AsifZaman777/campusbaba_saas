import { Request, Response } from "express";
import { SuperAdmin } from "../masterModels/SuperAdmin";
import { Tenant } from "../masterModels/Tenant";
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
    // For simplicity, we use the same MongoDB host but with a different DB name
    const defaultUri = process.env.MONGO_URI || "mongodb://localhost:27017/campusbaba";
    const baseUri = defaultUri.substring(0, defaultUri.lastIndexOf("/"));
    const tenantDbURI = `${baseUri}/tenant_${subdomain}`;

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
      designation: "Principal",
      joiningDate: new Date(),
      department: null,
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      phone: "00000000000",
      gender: "other",
      dateOfBirth: new Date(),
      bloodGroup: "A+",
      address: {
        present: "CampusBaba",
        permanent: "CampusBaba"
      }
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
