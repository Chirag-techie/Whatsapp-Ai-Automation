import { Router } from "express";

import {
  handleWebhook,
  verifyWebhook,
} from "./whatsapp.controller.js";

import {
  simulateInbound,
} from "./whatsapp.mock.controller.js";

const router = Router();

router.get("/", verifyWebhook);

router.post("/", handleWebhook);

// Mock local testing endpoint
router.post(
  "/mock",
  simulateInbound,
);

export default router;