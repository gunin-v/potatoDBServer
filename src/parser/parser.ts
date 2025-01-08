import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer-extra";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import logger from "../logger";
import { retry } from "./helpers";
import { parseLenta } from "./shops/lenta";
import { parseMagnet } from "./shops/magnit";
import { parsePerekrestok } from "./shops/perekrestok";
import { parsePyaterochka } from "./shops/pyaterochka";
import { parseVkusvill } from "./shops/vkusvill";

puppeteer.use(AnonymizeUAPlugin());
puppeteer.use(StealthPlugin());

const prisma = new PrismaClient();

export const parseAndSaveProductsPrices = async () => {
  logger.info("🚀 Запускаем парсинг...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    const magnetPrices = await retry(() => parseMagnet(page), 5);
    const perekrestokPrices = await retry(() => parsePerekrestok(page), 5);
    const vkusvillPrices = await retry(() => parseVkusvill(page), 5);
    const lentaPrices = await retry(() => parseLenta(page), 5);
    const pyaterochkaPrices = await retry(() => parsePyaterochka(page), 5);

    const allPrices = [
      ...magnetPrices,
      ...perekrestokPrices,
      ...vkusvillPrices,
      ...lentaPrices,
      ...pyaterochkaPrices,
    ];

    for (const product of allPrices) {
      await prisma.product.create({
        data: product,
      });
    }

    logger.info("🔥 Данные успешно сохранены в базу данных");
    return allPrices;
  } catch (error) {
    logger.error("❌ Ошибка парсинга данных: ", error);
    throw error;
  } finally {
    await browser.close();
  }
};
