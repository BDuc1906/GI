import winston from 'winston';
import { randomUUID } from 'crypto';

// Format cho development (màu sắc, dễ đọc)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
    const reqId = requestId ? `[${requestId}] ` : '';
    return `${timestamp} ${level}: ${reqId}${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  })
);

// Format cho production (JSON)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const isDev = process.env.NODE_ENV !== 'production';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  format: isDev ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error', 'warn'],
    }),
  ],
  defaultMeta: { service: 'leibo' },
});

// Hàm tạo requestId và log kèm
export const withRequestId = () => {
  const requestId = randomUUID().slice(0, 8);
  return {
    requestId,
    child: logger.child({ requestId }),
  };
};

// Export mặc định để dùng trong scripts (không có requestId)
export default logger;