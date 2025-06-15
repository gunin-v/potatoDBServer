import { Router } from "express";
import { fetchProductsController } from "./controllers/fetchProductsController";
import { runParseController } from "./controllers/runParseController";

const router = Router();

router.get("/api/products", fetchProductsController);
router.post("/api/parse", runParseController);

export default router;
