import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Загрузка переменных окружения из .env файла
dotenv.config();

const prisma = new PrismaClient();

const clearDatabase = async () => {
  try {
    console.log("🚀 Очистка базы данных...");
    await prisma.product.deleteMany({});
    console.log("✅ База данных успешно очищена");
  } catch (error) {
    console.error("❌ Ошибка очистки базы данных:", error);
  } finally {
    await prisma.$disconnect();
  }
};

clearDatabase();
