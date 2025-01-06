import type { Page } from "puppeteer";
import logger from "../../logger";
import { filterPotatoes } from "../helpers";
import type { Product } from "../types";

export const parsePerekrestok = async (page: Page): Promise<Product[]> => {
  logger.info("🛒 [Перекресток] Начинаем парсинг...");

  await page.goto(
    "https://www.perekrestok.ru/cat/search?search=%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%88%D0%BA%D0%B0"
  );

  // Дожидаемся появления карточек товаров
  await page.waitForSelector(".product-card__content", { visible: true });

  const products: Product[] = await page.evaluate(() => {
    const productElements = document.querySelectorAll(".product-card__content");

    return Array.from(productElements).map((el) => {
      const nameElement = el.querySelector(".product-card__title");
      const priceElement = el.querySelector(".product-card__pricing");
      const sizeElement = el.querySelector(".product-card__size");
      const priceOldElement = el.querySelector(".price-old");

      let name = nameElement?.textContent?.trim() || "Неизвестный продукт";

      let price = Number.parseFloat(
        priceElement?.textContent
          ?.replace(",", ".")
          .replace(/\s/g, "")
          .trim() || "0"
      );

      let discountPrice = null;

      if (priceOldElement) {
        discountPrice = price;
        const priceOldText = priceOldElement.textContent || "";
        const priceOldMatch = priceOldText.match(/(\d+,\d+|\d+)\s?₽/);
        if (priceOldMatch) {
          price = Number.parseFloat(priceOldMatch[1].replace(",", "."));
        }
      }

      if (sizeElement) {
        const sizeText = sizeElement.textContent?.trim() || "1кг";
        const sizeMatch = sizeText.match(/(\d+,\d+|\d+)\s?(кг|гр)/);

        if (sizeMatch) {
          const size = Number.parseFloat(sizeMatch[1].replace(",", "."));
          const unit = sizeMatch[2];

          if (unit === "гр") {
            price = (price / size) * 1000; // Переводим цену за грамм в цену за килограмм
            if (discountPrice) {
              discountPrice = (discountPrice / size) * 1000;
            }
          } else if (unit === "кг") {
            price = price / size; // Переводим цену за упаковку в цену за килограмм
            if (discountPrice) {
              discountPrice = discountPrice / size;
            }
            if (size !== 1) {
              name += ` (${size}кг)`; // Добавляем постфикс с весом к названию
            }
          }
        }
      }

      // Округляем цену до двух знаков после запятой
      price = Math.round(price * 100) / 100;

      if (discountPrice) {
        discountPrice = Math.round(discountPrice * 100) / 100;
      }

      return { name, price, discountPrice, store: "Перекресток" };
    });
  });

  // Фильтрация продуктов, оставляем только "просто картошку"
  const filteredProducts = filterPotatoes(products);

  logger.info("🛒 [Перекресток] Парсинг завершен");
  logger.info(filteredProducts);

  return filteredProducts;
};
