import { Router } from "express";
import { fetchProducts } from "./services/products/fetch";

const router = Router();

router.get("/api/products", fetchProducts);

export default router;
