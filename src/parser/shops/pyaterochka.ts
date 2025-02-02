import type { Page } from "playwright";
import logger from "../../logger";
import { filterPotatoes } from "../helpers";
import type { Product } from "../types";

export const parsePyaterochka = async (page: Page): Promise<Product[]> => {
  logger.info("🛒 [Пятерочка] Начинаем парсинг...");

  await page.goto("https://5ka.ru/");

  // Найдите поле поиска и введите текст "картошка"
  await page.waitForSelector('input[placeholder="Поиск"]');
  await page.type('input[placeholder="Поиск"]', "картошка");

  // Дождитесь появления элемента с id "search-menu"
  await page.waitForSelector("#search-menu", { state: "visible" });

  // Дождитесь появления первого элемента с текстом "Картофель"
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll("#search-menu .chakra-link")).some(
        (el) => el.textContent?.includes("Картофель")
      ),
    { timeout: 5000 }
  );

  const products: Product[] = await page.evaluate(() => {
    const productElements = document.querySelectorAll(
      "#search-menu .chakra-link"
    );

    return Array.from(productElements).map((el) => {
      const nameElement = el.querySelector("div:nth-child(2) > p:nth-child(2)");
      const sizeElement = el.querySelector("div:nth-child(2) > p:nth-child(3)");
      const priceContainer = el.querySelector("div:nth-child(3)");
      const priceRubElement = priceContainer?.querySelector(
        "div:first-child > p:nth-child(1)"
      );
      const priceKopElement = priceContainer?.querySelector(
        "div:first-child > p:nth-child(2)"
      );

      const name = nameElement?.textContent?.trim() || "Неизвестный продукт";
      const sizeText = sizeElement?.textContent?.trim() || "1 кг";
      let price = Number.parseFloat(
        `${priceRubElement?.textContent?.trim() || "0"}.${
          priceKopElement?.textContent?.trim() || "00"
        }`
      );

      let discountPrice = null;

      // Проверка на наличие скидки
      if (priceContainer?.children.length === 2) {
        const oldPriceRubElement = priceContainer.querySelector(
          "div:nth-child(1) > p:nth-child(2)"
        );
        const oldPriceKopElement = priceContainer.querySelector(
          "div:nth-child(1) > p:nth-child(3)"
        );
        const discountPriceRubElement = priceContainer.querySelector(
          "div:nth-child(2) > p:nth-child(1)"
        );
        const discountPriceKopElement = priceContainer.querySelector(
          "div:nth-child(2) > p:nth-child(2)"
        );

        if (discountPriceRubElement && discountPriceKopElement) {
          discountPrice = Number.parseFloat(
            `${discountPriceRubElement.textContent?.trim() || "0"}.${
              discountPriceKopElement.textContent?.trim() || "00"
            }`
          );
        }

        if (oldPriceRubElement && oldPriceKopElement) {
          price = Number.parseFloat(
            `${oldPriceRubElement.textContent?.trim() || "0"}.${
              oldPriceKopElement.textContent?.trim() || "00"
            }`
          );
        }
      }

      const sizeMatch = sizeText.match(/(\d+,\d+|\d+\.\d+|\d+)\s?(кг|г)/);
      if (sizeMatch) {
        const size = Number.parseFloat(sizeMatch[1].replace(",", "."));
        const unit = sizeMatch[2];

        if (unit === "г") {
          price = (price / size) * 1000; // Переводим цену за грамм в цену за килограмм
          if (discountPrice) {
            discountPrice = (discountPrice / size) * 1000;
          }
        } else if (unit === "кг") {
          price = price / size; // Переводим цену за упаковку в цену за килограмм
          if (discountPrice) {
            discountPrice = discountPrice / size;
          }
        }
      }

      // Округляем цену до двух знаков после запятой
      price = Math.round(price * 100) / 100;

      if (discountPrice) {
        discountPrice = Math.round(discountPrice * 100) / 100;
      }

      return { name, price, discountPrice, store: "Пятерочка" };
    });
  });

  // Фильтрация продуктов, оставляем только "просто картошку"
  const filteredProducts = filterPotatoes(products);

  logger.info("🛒 [Пятерочка] Парсинг завершен");
  logger.info(JSON.stringify(filteredProducts));

  return filteredProducts;
};
