import winston from "winston";

// Формат логов
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// Создание логгера
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(), // Логи в консоль
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Ошибки в файл
    new winston.transports.File({ filename: "logs/combined.log" }), // Все логи в файл
  ],
});

// Если не в продакшене, включаем логи в консоль
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
