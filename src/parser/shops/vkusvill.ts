import type { Page } from "playwright";
import logger from "../../logger";
import { filterPotatoes } from "../helpers";
import type { Product } from "../types";

export const parseVkusvill = async (page: Page): Promise<Product[]> => {
  logger.info("🛒 [ВкусВилл] Начинаем парсинг...");

  await page.goto(
    "https://vkusvill.ru/search/?type=products&q=%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%84%D0%B5%D0%BB%D1%8C"
  );

  // Дожидаемся появления карточек товаров
  await page.waitForSelector(".ProductCard__content", { state: "visible" });

  const products: Product[] = await page.evaluate(() => {
    const productElements = document.querySelectorAll(".ProductCard__content");

    return Array.from(productElements).map((el) => {
      const nameElement = el.querySelector(".ProductCard__link");
      const priceElement = el.querySelector(
        ".ProductCard__price .Price--label"
      );
      const sizeElement = el.querySelector(".ProductCard__weight");

      const name = nameElement?.textContent?.trim() || "Неизвестный продукт";
      let price = 0;

      if (sizeElement) {
        console.log(`Processing sizeElement for ${name}`);
        // Если есть sizeElement, значит цена указана за упаковку
        price = Number.parseFloat(
          priceElement?.textContent
            ?.replace("₽", "")
            .replace(",", ".")
            .trim() || "0"
        );

        const sizeText = sizeElement.textContent?.trim() || "1кг";
        const sizeMatch = sizeText.match(/(\d+,\d+|\d+)\s?(кг|гр)/);

        if (sizeMatch) {
          const size = Number.parseFloat(sizeMatch[1].replace(",", "."));
          const unit = sizeMatch[2];

          if (unit === "гр") {
            price = (price / size) * 1000; // Переводим цену за грамм в цену за килограмм
          } else if (unit === "кг") {
            price = price / size; // Переводим цену за упаковку в цену за килограмм
          }
        }
      } else {
        console.log(`Processing pricePerKg for ${name}`);
        // Если sizeElement нет, значит цена указана за килограмм
        price = Number.parseFloat(
          priceElement?.textContent
            ?.replace("₽/кг", "")
            .replace(",", ".")
            .trim() || "0"
        );
      }

      // Округляем цену до двух знаков после запятой
      price = Math.round(price * 100) / 100;

      return { name, price, store: "ВкусВилл" };
    });
  });

  // Фильтрация продуктов, оставляем только "просто картошку"
  const filteredProducts = filterPotatoes(products);

  logger.info("🛒 [ВкусВилл] Парсинг завершен");
  logger.info(JSON.stringify(filteredProducts));

  return filteredProducts;
};
