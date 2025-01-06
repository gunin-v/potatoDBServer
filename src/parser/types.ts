import type { Prisma } from "@prisma/client";

export type Product = Omit<Prisma.ProductCreateInput, "updated_at">;
