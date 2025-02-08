import { PrismaClient } from "@prisma/client";
import logger from "../../logger";
import type { Product } from "../types";
import { saveProducts } from "./saveResults";

jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    product: {
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});
jest.mock("../../logger");

describe("saveProducts", () => {
  const products: Product[] = [
    { name: "Картофель", price: 100, store: "Магнит" },
    { name: "Картофель", price: 90, store: "Перекресток" },
  ];

  let prismaMock: PrismaClient;

  beforeEach(() => {
    prismaMock = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("должен успешно сохранить продукты в базу данных", async () => {
    await saveProducts(products);

    expect(prismaMock.product.create).toHaveBeenCalledTimes(products.length);
    products.forEach((product, index) => {
      expect(prismaMock.product.create).toHaveBeenNthCalledWith(index + 1, {
        data: product,
      });
    });

    expect(logger.info).toHaveBeenCalledWith(
      "🔥 Данные успешно сохранены в базу данных"
    );
  });

  it("должен логировать ошибку при неудачном сохранении данных", async () => {
    const error = new Error("Ошибка сохранения");
    (prismaMock.product.create as jest.Mock).mockRejectedValueOnce(error);

    await expect(saveProducts(products)).rejects.toThrow(error);

    expect(prismaMock.product.create).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      "❌ Ошибка сохранения данных в базу: ",
      error
    );
  });
});
