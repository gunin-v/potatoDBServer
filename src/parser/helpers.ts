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
