import { logger } from "./core/logger/logger.js";

import "./workers/whatsapp.worker.js";

logger.info("WhatsApp worker server started");