import type { Page } from "playwright";
import logger from "../../logger";
import { retry } from "../helpers";
import { parseLenta } from "../shops/lenta";
import { parseMagnet } from "../shops/magnit";
import { parsePerekrestok } from "../shops/perekrestok";
import { parsePyaterochka } from "../shops/pyaterochka";
import { parseVkusvill } from "../shops/vkusvill";
import { parseProducts } from "./parseProducts";

jest.mock("../../logger");
jest.mock("../helpers");
jest.mock("../shops/lenta");
jest.mock("../shops/magnit");
jest.mock("../shops/perekrestok");
jest.mock("../shops/pyaterochka");
jest.mock("../shops/vkusvill");

describe("parseProducts", () => {
  let pageMock: Page;

  beforeEach(() => {
    pageMock = {} as unknown as Page;

    (retry as jest.Mock).mockImplementation((fn) => fn());

    (parseLenta as jest.Mock).mockResolvedValue([
      { name: "Картофель Лента", price: 100 },
    ]);
    (parseMagnet as jest.Mock).mockResolvedValue([
      { name: "Картофель Магнит", price: 90 },
    ]);
    (parsePerekrestok as jest.Mock).mockResolvedValue([
      { name: "Картофель Перекресток", price: 95 },
    ]);
    (parsePyaterochka as jest.Mock).mockResolvedValue([
      { name: "Картофель Пятерочка", price: 85 },
    ]);
    (parseVkusvill as jest.Mock).mockResolvedValue([
      { name: "Картофель ВкусВилл", price: 110 },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("должен успешно парсить продукты из всех магазинов", async () => {
    const allPrices = await parseProducts(pageMock);

    expect(allPrices).toEqual([
      { name: "Картофель Магнит", price: 90 },
      { name: "Картофель Перекресток", price: 95 },
      { name: "Картофель ВкусВилл", price: 110 },
      { name: "Картофель Лента", price: 100 },
      { name: "Картофель Пятерочка", price: 85 },
    ]);

    expect(retry).toHaveBeenCalledTimes(5);
    expect(parseLenta).toHaveBeenCalledWith(pageMock);
    expect(parseMagnet).toHaveBeenCalledWith(pageMock);
    expect(parsePerekrestok).toHaveBeenCalledWith(pageMock);
    expect(parsePyaterochka).toHaveBeenCalledWith(pageMock);
    expect(parseVkusvill).toHaveBeenCalledWith(pageMock);
  });

  it("должен логировать ошибки и продолжать парсинг", async () => {
    (parseMagnet as jest.Mock).mockRejectedValueOnce(
      new Error("Ошибка Магнит")
    );

    const allPrices = await parseProducts(pageMock);

    expect(allPrices).toEqual([
      { name: "Картофель Перекресток", price: 95 },
      { name: "Картофель ВкусВилл", price: 110 },
      { name: "Картофель Лента", price: 100 },
      { name: "Картофель Пятерочка", price: 85 },
    ]);

    expect(logger.error).toHaveBeenCalledWith(
      "❌ Ошибка парсинга данных: ",
      new Error("Ошибка Магнит")
    );
    expect(retry).toHaveBeenCalledTimes(5);
    expect(parseLenta).toHaveBeenCalledWith(pageMock);
    expect(parseMagnet).toHaveBeenCalledWith(pageMock);
    expect(parsePerekrestok).toHaveBeenCalledWith(pageMock);
    expect(parsePyaterochka).toHaveBeenCalledWith(pageMock);
    expect(parseVkusvill).toHaveBeenCalledWith(pageMock);
  });
});
