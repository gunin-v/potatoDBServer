import { PrismaClient } from "@prisma/client";
import logger from "../../logger";
import type { Product } from "../types";

const prisma = new PrismaClient();

export const saveProducts = async (products: Product[]) => {
  try {
    for (const product of products) {
      await prisma.product.create({
        data: product,
      });
    }

    logger.info("🔥 Данные успешно сохранены в базу данных");
  } catch (error) {
    logger.error("❌ Ошибка сохранения данных в базу: ", error);
    throw error;
  }
};
