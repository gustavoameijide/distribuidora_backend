import Router from "express-promise-router";
import {
  actualizarColores,
  crearColores,
  eliminarColor,
  getColor,
  getColores,
} from "../controllers/colores.controllers.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/colores", isAuth, getColores);

router.get("/colores/:id", isAuth, getColor);

router.post("/colores", isAuth, crearColores);

router.put("/colores/:id", isAuth, actualizarColores);

router.delete("/colores/:id", isAuth, eliminarColor);

export default router;
