import type { TDBCLient } from "../../db/prismaClient";
import type { ProductQueryDTO } from "./dto";

export async function getProducts(dto: ProductQueryDTO, db: TDBCLient) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const where: any = {};
  if (dto.date_from || dto.date_to) {
    where.date = {};
    if (dto.date_from) where.date.gte = new Date(dto.date_from);
    if (dto.date_to) where.date.lte = new Date(dto.date_to);
  }
  if (dto.store) where.store = dto.store;

  return db.product.findMany({
    where,
    take: dto.limit ? Number(dto.limit) : 100,
    skip: dto.offset ? Number(dto.offset) : 0,
  });
}
