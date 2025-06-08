import { Request, Response } from "express";
import {
  validateProductQuery,
  ProductQueryDTO,
} from "../services/products/dto";
import { getProducts } from "../services/products/productService";
import { prisma } from "../db/prismaClient";

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
export const fetchProductsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const dto: ProductQueryDTO = req.query;
  const error = validateProductQuery(dto);
  if (error) {
    res.status(400).send(error);
    return;
  }
  try {
    const products = await getProducts(dto, prisma);
    res.json(products);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error fetching products");
  }
};
