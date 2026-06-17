import { Request, Response, NextFunction } from "express";
import { Tenant } from "../masterModels/Tenant";
import TenantConnectionManager from "../utils/TenantConnectionManager";
import { Connection } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      tenantConnection?: Connection;
      tenant?: any;
    }
  }
}

export const tenantResolver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get subdomain from header (x-tenant-id) or from hostname
    let tenantId = req.headers["x-tenant-id"] as string;
    
    if (!tenantId) {
      // Extract from hostname (e.g. schoolA.campusbaba.com -> schoolA)
      const hostParts = req.hostname.split('.');
      if (hostParts.length >= 3) {
        tenantId = hostParts[0];
      }
    }

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID missing from headers (x-tenant-id) or invalid subdomain",
      });
    }

    // Look up tenant in Master DB
    const tenant = await Tenant.findOne({ subdomain: tenantId });
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // Check subscription status
    if (tenant.subscriptionStatus === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Tenant subscription is inactive. Please contact support.",
      });
    }

    // Get/Create Tenant DB Connection
    const connection = TenantConnectionManager.getTenantConnection(
      tenant.subdomain,
      tenant.dbURI
    );

    // Attach to request (legacy compatibility)
    req.tenantConnection = connection;
    req.tenant = tenant;

    // Run within AsyncLocalStorage context
    import("../utils/asyncLocalStorage").then(({ tenantContext }) => {
        tenantContext.run(connection, () => {
          next();
        });
    });
  } catch (error) {
    console.error("Tenant Resolver Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve tenant",
    });
  }
};
