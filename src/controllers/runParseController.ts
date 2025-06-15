import type { Request, Response } from "express";
import logger from "../logger";
import { parseAndSaveProductsPrices } from "../parser/parser";

/**
 * @swagger
 * /api/parse:
 *   post:
 *     summary: Запустить парсинг продуктов вручную
 *     description: Запускает процесс парсинга и сохранения цен продуктов.
 *     responses:
 *       200:
 *         description: Парсинг успешно завершён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Ошибка парсинга
 */
export async function runParseController(req: Request, res: Response) {
  try {
    const data = await parseAndSaveProductsPrices();
    logger.info("[Manual Parse] Данные успешно спарсены", data);
    res.status(200).json({ message: "Парсинг успешно завершён", data });
  } catch (error) {
    logger.error("[Manual Parse] Ошибка парсинга", error);
    res.status(500).json({ message: "Ошибка парсинга", error: String(error) });
  }
}
