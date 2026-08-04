import pino from 'pino';
import { config } from './index.js';

if (!config.SERVICE_NAME) {
  throw new Error(`SERVICE_NAME is missing in environment variables`)
}

if (!config.NODE_ENV) {
  throw new Error(`NODE_ENV is missing in environment variables`)
}

// Pino root logger – pretty‑printed for human console reading
export const logger = pino({
  name: config.SERVICE_NAME,
  level: 'info',                     // fixed, as requested
  // base: { service: config.SERVICE_NAME },    // appears in every log line
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname',        // keep output clean
    },
  },
});


// Augment Express Request to carry a request‑scoped child logger
declare global {
  namespace Express {
    interface Request {
      log: pino.Logger;
    }
  }
}
