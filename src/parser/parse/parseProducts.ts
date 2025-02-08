import type { Page } from "playwright";
import logger from "../../logger";
import { retry } from "../helpers";
import { parseLenta } from "../shops/lenta";
import { parseMagnet } from "../shops/magnit";
import { parsePerekrestok } from "../shops/perekrestok";
import { parsePyaterochka } from "../shops/pyaterochka";
import { parseVkusvill } from "../shops/vkusvill";

export const parseProducts = async (page: Page) => {
  const parsers = [
    (page: Page) => retry(() => parseMagnet(page), 5),
    (page: Page) => retry(() => parsePerekrestok(page), 5),
    (page: Page) => retry(() => parseVkusvill(page), 5),
    (page: Page) => retry(() => parseLenta(page), 5),
    (page: Page) => retry(() => parsePyaterochka(page), 5),
  ];

  const allPrices = [];

  for (const parser of parsers) {
    try {
      const result = await parser(page);
      allPrices.push(...result);
    } catch (error) {
      logger.error("❌ Ошибка парсинга данных: ", error);
    }
  }

  return allPrices;
};
