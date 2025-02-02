import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

import logger from "../logger";
import { retry } from "./helpers";
import { parseLenta } from "./shops/lenta";
import { parseMagnet } from "./shops/magnit";
import { parsePerekrestok } from "./shops/perekrestok";
import { parsePyaterochka } from "./shops/pyaterochka";
import { parseVkusvill } from "./shops/vkusvill";

const prisma = new PrismaClient();

chromium.use(stealth());

export const parseAndSaveProductsPrices = async () => {
  logger.info("🚀 Запускаем парсинг...");
  const browser = await chromium.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    javaScriptEnabled: true,
  });
  const page = await context.newPage();
  await page.setExtraHTTPHeaders({
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.mouse.move(100, 200);

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
