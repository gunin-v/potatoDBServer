import { Router } from "express";
import { fetchProductsController } from "./controllers/fetchProductsController";

const router = Router();

router.get("/api/products", fetchProductsController);

export default router;
