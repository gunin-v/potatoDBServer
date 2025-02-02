import type { Page } from "playwright";
import logger from "../../logger";
import { filterPotatoes } from "../helpers";
import type { Product } from "../types";

export const parseLenta = async (page: Page): Promise<Product[]> => {
  logger.info("🛒 [Лента] Начинаем парсинг...");

  await page.goto(
    "https://lenta.com/search/%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%88%D0%BA%D0%B0/"
  );

  // Дождитесь появления карточек продуктов
  await page.waitForSelector(".product-card_middle-content", {
    state: "visible",
  });

  const products: Product[] = await page.evaluate(() => {
    const productElements = document.querySelectorAll(
      ".product-card_middle-content"
    );

    return Array.from(productElements)
      .map((el) => {
        const nameElement = el.querySelector(".card-name_content");
        const priceElement = el.querySelector(".main-price");
        const oldPriceElement = el.querySelector(".old-price > span");
        const priceTypeElement = el.querySelector(".price");

        const name = nameElement?.textContent?.trim() || "Неизвестный продукт";
        let price = 0;
        let discountPrice = null;

        // Извлекаем цену и копейки
        const priceText = priceElement?.textContent?.replace(/\s/g, "").trim();
        if (priceText) {
          price = Number.parseFloat(priceText.replace(",", "."));
        }

        // Если есть скидка, берем цену из old-price
        if (priceElement?.classList.contains("__accent") && oldPriceElement) {
          const oldPriceText = oldPriceElement.textContent
            ?.replace(/\s/g, "")
            .trim();
          if (oldPriceText) {
            discountPrice = price;
            price = Number.parseFloat(oldPriceText.replace(",", "."));
          }
        }

        const priceType = priceTypeElement?.textContent?.trim() || "";
        if (priceType !== "Цена за 1 кг") {
          return null; // Пропускаем продукты, которые продаются не за килограмм
        }

        // Округляем цену до двух знаков после запятой
        price = Math.round(price * 100) / 100;

        if (discountPrice) {
          discountPrice = Math.round(discountPrice * 100) / 100;
        }

        return { name, price, discountPrice, store: "Лента" };
      })
      .filter((product) => product !== null) as Product[];
  });

  // Фильтрация продуктов, оставляем только "просто картошку"
  const filteredProducts = filterPotatoes(products);

  logger.info("🛒 [Лента] Парсинг завершен");
  logger.info(JSON.stringify(filteredProducts));

  return filteredProducts;
};
