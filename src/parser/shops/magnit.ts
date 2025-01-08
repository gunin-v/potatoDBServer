import type { Page } from "puppeteer";
import logger from "../../logger";
import { filterPotatoes } from "../helpers";
import type { Product } from "../types";

export const parseMagnet = async (page: Page): Promise<Product[]> => {
  logger.info("🛒 [Магнит] Начинаем парсинг...");
  await page.goto(
    "https://magnit.ru/search?term=%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%88%D0%BA%D0%B0"
  );

  // Дожидаемся появления карточек товаров
  await page.waitForSelector(".unit-catalog-product-preview-description");

  const products: Product[] = await page.evaluate(() => {
    const productElements = document.querySelectorAll(
      ".unit-catalog-product-preview-description"
    );

    return Array.from(productElements).map((el) => {
      const nameElement = el.querySelector(
        ".unit-catalog-product-preview-title"
      );
      const pricePerKgElement = el.querySelector(
        ".unit-catalog-product-preview-weighted span"
      );
      const priceElement = el.querySelector(
        ".unit-catalog-product-preview-prices__regular span"
      );
      const weightElement = el.querySelector(
        ".unit-catalog-product-preview-unit-value"
      );

      let name = nameElement?.textContent?.trim() || "Неизвестный продукт";
      let price = Number.parseFloat(
        (pricePerKgElement || priceElement)?.textContent
          ?.replace("₽", "")
          .replace(",", ".")
          .trim() || "0"
      );

      // Округляем цену до двух знаков после запятой
      price = Math.round(price * 100) / 100;

      const weightText = weightElement?.textContent?.trim() || "1кг";
      const weightMatch = weightText.match(/(\d+)(кг|г)/);

      if (weightMatch) {
        const weight = Number.parseFloat(weightMatch[1]);
        const unit = weightMatch[2];

        if (unit === "кг" && weight !== 1) {
          name += `(${weight}кг)`; // Добавляем постфикс с весом к названию
        }
      }

      return { name, price, store: "Магнит" };
    });
  });

  // Фильтрация продуктов, оставляем только "просто картошку"
  const filteredProducts = filterPotatoes(products);

  logger.info("🛒 [Магнит] Парсинг завершен");
  logger.info(JSON.stringify(filteredProducts));

  return filteredProducts;
};
