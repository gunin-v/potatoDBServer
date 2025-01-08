import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import cron from "node-cron";
import logger from "./logger";
import { parseAndSaveProductsPrices } from "./parser/parser";
import router from "./routes";
import { setupSwagger } from "./swagger";

// Загрузка переменных окружения из .env файла
dotenv.config();

const app = express();

app.use("/", router);
setupSwagger(app);

cron.schedule("0 0 * * *", async () => {
  logger.info("⏰ [Cron] Запуск ежедневного парсинга данных...");
  try {
    const data = await parseAndSaveProductsPrices();
    logger.info("✅ [Cron] Данные успешно спарсены:", data);
  } catch (error) {
    logger.error("❌ [Cron] Ошибка парсинга данных:", error);
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT, () => {
    logger.info(`Server is running on http://localhost:${process.env.PORT}`);
  });
}

export default app;
