import logger from "../logger";
import type { Product } from "./types";

export const filterPotatoes = (products: Product[]): Product[] => {
  const excludedKeywords = [
    "фри",
    "чипсы",
    "сухая смесь",
    "отварной",
    "пастеризованный",
    "быстрозамороженный",
    "укроп",
    "соус",
    "острый",
    "халяль",
    "по-деревенски",
    "овощи",
    "пюре",
    "крахмал",
    "со вкусом",
    "запеченный",
    "дольки",
    "замороженный",
  ];

  return products.filter((product) => {
    const lowerName = product.name.toLowerCase();
    return (
      lowerName.includes("картофель") &&
      !excludedKeywords.some((keyword) => lowerName.includes(keyword))
    );
  });
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (Array.isArray(result) && result.length > 0) {
        return result;
      }
      if (!Array.isArray(result)) {
        return result;
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error(`Попытка ${i + 1} не удалась: ${errorMessage}`);
    }
  }

  throw new Error(`Все ${retries} попыток завершились неудачей`);
};
