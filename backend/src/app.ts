import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import whatsappRoutes from "./modules/whatsapp/whatsapp.routes.js";
import healthRoutes from "./modules/health/health.routes.js";

import { logger } from "./core/logger/logger.js";

import { errorMiddleware } from "./core/middleware/error.middleware.js";
import { notFoundMiddleware } from "./core/middleware/not-found.middleware.js";

const app = express();

app.use(
  pinoHttp({
    logger,
  })
);

app.use(helmet());

app.use(cors());

app.use(
  express.json({
    verify: (req, _res, buffer) => {
      req.rawBody = buffer;
    },
  })
);

app.use("/health", healthRoutes);

app.use("/webhooks/whatsapp", whatsappRoutes);

// MUST BE LAST
app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;