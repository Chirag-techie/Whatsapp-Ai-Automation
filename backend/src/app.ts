import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttpPkg from "pino-http";

import { logger } from "./core/logger/logger.js";

import whatsappRoutes from "./modules/whatsapp/whatsapp.routes.js";

const pinoHttp =
  pinoHttpPkg.default ?? pinoHttpPkg;

export const app = express();

app.use(helmet());

app.use(cors());

app.use(
  express.json({
    verify: (req, _res, buffer) => {
      (
        req as express.Request & {
          rawBody?: Buffer;
        }
      ).rawBody = buffer;
    },
  }),
);

app.use(
  pinoHttp({
    logger,
  }),
);

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server healthy",
  });
});

app.use("/whatsapp", whatsappRoutes);