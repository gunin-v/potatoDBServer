import dotenv from "dotenv";
import logger from "../logger";
import { parseAndSaveProductsPrices } from "../parser/parser";

// Загрузка переменных окружения из .env файла
dotenv.config();

const runManualParsing = async () => {
  logger.info("🚀 Запуск ручного парсинга данных...");
  try {
    const data = await parseAndSaveProductsPrices();
    logger.info("✅ Данные успешно спарсены:", data);
  } catch (error) {
    logger.error("❌ Ошибка парсинга данных:", error);
  }
};

runManualParsing();
