import express, { type Request, type Response } from "express";
import cron from "node-cron";
import { PORT } from "./constants";
import logger from "./logger";
import { parseAndSaveProductsPrices } from "./parser/parser";
import router from "./routes";
import { setupSwagger } from "./swagger";

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
  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
