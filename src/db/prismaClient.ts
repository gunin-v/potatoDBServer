import { PrismaClient } from "@prisma/client";

export type TDBCLient = PrismaClient;

export const prisma = new PrismaClient();
