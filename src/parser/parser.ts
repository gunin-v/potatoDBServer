import { type Prisma, PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer-extra";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import logger from "../logger";
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

  const magnetPrices = await parseMagnet(page);
  const perekrestokPrices = await parsePerekrestok(page);
  const vkusvillPrices = await parseVkusvill(page);
  const lentaPrices = await parseLenta(page);
  const pyaterochkaPrices = await parsePyaterochka(page);

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
  await browser.close();

  return allPrices;
};
