import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import { fetchProductsController } from "./fetchProductsController";

jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    product: {
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe("fetchProducts", () => {
  let prisma: PrismaClient;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  beforeEach(() => {
    req = { query: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should fetch products without filters", async () => {
    const mockProducts = [
      { id: 1, name: "Картошка", price: 30.5, store: "Магнит" },
      { id: 2, name: "Картошка", price: 25.0, store: "Пятерочка" },
    ];
    (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

    await fetchProductsController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(mockProducts);
    expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
  });

  it("should fetch products with date filters", async () => {
    req.query = { date_from: "2024-01-01", date_to: "2024-01-31" };
    const mockProducts = [
      {
        id: 1,
        name: "Картошка",
        price: 30.5,
        store: "Магнит",
        date: new Date("2024-01-15"),
      },
    ];
    (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

    await fetchProductsController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(mockProducts);
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        date: {
          gte: new Date("2024-01-01"),
          lte: new Date("2024-01-31"),
        },
      },
      take: 100,
      skip: 0,
    });
  });

  it("should fetch products with store filter", async () => {
    req.query = { store: "Магнит" };
    const mockProducts = [
      { id: 1, name: "Картошка", price: 30.5, store: "Магнит" },
    ];
    (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

    await fetchProductsController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(mockProducts);
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { store: "Магнит" },
      take: 100,
      skip: 0,
    });
  });

  it("should fetch products with pagination", async () => {
    req.query = { limit: "50", offset: "0" };
    const mockProducts = [
      { id: 1, name: "Картошка", price: 30.5, store: "Магнит" },
    ];
    (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

    await fetchProductsController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(mockProducts);
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {},
      take: 50,
      skip: 0,
    });
  });

  it("should handle invalid date_from format", async () => {
    req.query = { date_from: "invalid-date" };

    await fetchProductsController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      "Invalid date_from format. Use YYYY-MM-DD."
    );
  });

  it("should handle invalid date_to format", async () => {
    req.query = { date_to: "invalid-date" };

    await fetchProductsController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      "Invalid date_to format. Use YYYY-MM-DD."
    );
  });

  it("should handle invalid limit", async () => {
    req.query = { limit: "-10" };

    await fetchProductsController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Limit must be a positive number.");
  });

  it("should handle invalid offset", async () => {
    req.query = { offset: "-10" };

    await fetchProductsController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      "Offset must be a non-negative number."
    );
  });
});
