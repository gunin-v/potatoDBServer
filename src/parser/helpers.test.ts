import logger from "../logger";
import { filterPotatoes, retry } from "./helpers";
import type { Product } from "./types";

jest.mock("../logger");

describe("filterPotatoes", () => {
  it("должен фильтровать продукты, содержащие 'картофель' и не содержащие исключенные ключевые слова", () => {
    const products: Product[] = [
      { name: "Картофель свежий", price: 100, store: "Магнит" },
      { name: "Картофель фри", price: 150, store: "Магнит" },
      { name: "Картофельные чипсы", price: 200, store: "Магнит" },
      { name: "Картофель пастеризованный", price: 120, store: "Магнит" },
      { name: "Картофель отварной", price: 130, store: "Магнит" },
    ];

    const filteredProducts = filterPotatoes(products);

    expect(filteredProducts).toEqual([
      { name: "Картофель свежий", price: 100, store: "Магнит" },
    ]);
  });

  it("должен возвращать пустой массив, если нет подходящих продуктов", () => {
    const products: Product[] = [
      { name: "Картофель фри", price: 150, store: "Магнит" },
      { name: "Картофель чипсы", price: 200, store: "Магнит" },
    ];

    const filteredProducts = filterPotatoes(products);

    expect(filteredProducts).toEqual([]);
  });
});

describe("retry", () => {
  it("должен успешно выполнить функцию с первой попытки", async () => {
    const mockFn = jest.fn().mockResolvedValue("успех");

    const result = await retry(mockFn, 3);

    expect(result).toBe("успех");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("должен успешно выполнить функцию после нескольких попыток", async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("ошибка"))
      .mockResolvedValueOnce("успех");

    const result = await retry(mockFn, 3);

    expect(result).toBe("успех");
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("должен выбросить ошибку после всех неудачных попыток", async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error("ршились неудачей"));

    await expect(retry(mockFn, 3)).rejects.toThrow(
      "Все 3 попыток завершились неудачей"
    );
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
