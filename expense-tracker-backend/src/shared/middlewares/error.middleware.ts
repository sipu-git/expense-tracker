import type { Request, Response, NextFunction } from "express"
import { ZodError } from "zod";
import { AppError } from "../../../lib/AppError.js";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 ERROR:", err);

  //   // Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.issues.map(issue => ({
      field: issue.path.join(".") || "unknown",
      message: issue.message
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  // Our custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    })
  }

  // Prisma known errors (P2002, P2025, etc.)
  if (err?.code === "P2002") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry found",
    });
  }

  if (err?.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  // Unknown / fallback error
  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};