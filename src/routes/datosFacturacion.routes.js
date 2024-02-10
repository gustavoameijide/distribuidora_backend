import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarDatoFacturacion,
  createDatoFacturacion,
  eliminarDatoFacturacion,
  getDatosFacturacion,
  getDatosFacturaciones,
} from "../controllers/datosFacturacion.controllers.js";

const router = Router();

router.get("/datos-facturacion", isAuth, getDatosFacturaciones);

router.get("/datos-facturacion/:id", isAuth, getDatosFacturacion);

router.post("/datos-facturacion", isAuth, createDatoFacturacion);

router.put("/datos-facturacion/:id", isAuth, actualizarDatoFacturacion);

router.delete("/datos-facturacion/:id", isAuth, eliminarDatoFacturacion);

export default router;
