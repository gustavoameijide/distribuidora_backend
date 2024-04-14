import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { getPagos, realizarPago } from "../controllers/pago.controllers.js";

const router = Router();

router.get("/pagos", isAuth, getPagos);
router.post("/realizar-pago", isAuth, realizarPago);

export default router;
