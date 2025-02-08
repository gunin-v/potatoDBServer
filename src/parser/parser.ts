import logger from "../logger";
import { configureParser } from "./configure/configureParser";
import { parseProducts } from "./parse/parseProducts";
import { saveProducts } from "./save/saveResults";
export const parseAndSaveProductsPrices = async () => {
  logger.info("🚀 Запускаем парсинг...");
  const { browser, page } = await configureParser();

  try {
    const allPrices = await parseProducts(page);

    await saveProducts(allPrices);

    return allPrices;
  } finally {
    await browser.close();
  }
};
