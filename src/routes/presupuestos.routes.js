import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarPresupuesto,
  createPresupuesto,
  eliminarPresupuesto,
  getPresupuesto,
  getPresupuestos,
} from "../controllers/presupuesto.controllers.js";

const router = Router();

router.get("/presupuesto", isAuth, getPresupuestos);

router.get("/presupuesto/:id", isAuth, getPresupuesto);

router.post("/presupuesto", isAuth, createPresupuesto);

router.put("/presupuesto/:id", isAuth, actualizarPresupuesto);

router.delete("/presupuesto/:id", isAuth, eliminarPresupuesto);

export default router;
