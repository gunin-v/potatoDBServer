import { PrismaClient } from "@prisma/client";
import { isValid, parseISO } from "date-fns";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

type FilterParams = {
  date?: {
    gte?: Date;
    lte?: Date;
  };
  store?: string;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *         store:
 *           type: string
 *         price:
 *           type: number
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get products with optional filters
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *       - in: query
 *         name: store
 *         schema:
 *           type: string
 *         description: Store name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip for pagination
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
export const fetchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      date_from,
      date_to,
      store,
      limit = 100,
      offset = 0,
    } = req.query || {};

    // Валидация параметров
    if (date_from && !isValid(parseISO(date_from as string))) {
      res.status(400).send("Invalid date_from format. Use YYYY-MM-DD.");
      return;
    }
    if (date_to && !isValid(parseISO(date_to as string))) {
      res.status(400).send("Invalid date_to format. Use YYYY-MM-DD.");
      return;
    }
    if (limit && (Number.isNaN(Number(limit)) || Number(limit) <= 0)) {
      res.status(400).send("Limit must be a positive number.");
      return;
    }
    if (offset && (Number.isNaN(Number(offset)) || Number(offset) < 0)) {
      res.status(400).send("Offset must be a non-negative number.");
      return;
    }

    // Формирование условий фильтрации
    const params: FilterParams = {};

    if (date_from) {
      params.date = { gte: new Date(date_from as string) };
    }
    if (date_to) {
      params.date = { ...params.date, lte: new Date(date_to as string) };
    }
    if (store) {
      params.store = store as string;
    }

    // Получение данных с учетом фильтров и пагинации
    const products = await prisma.product.findMany({
      where: params,
      take: Number(limit),
      skip: Number(offset),
    });

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching products");
  }
};
