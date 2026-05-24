import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod"; // <-- Added Zod

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { logger } from "../logger/logger.js";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err);

  // <-- New Zod Handling Block -->
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message
  });
};