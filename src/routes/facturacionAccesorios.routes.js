import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarFacturacion,
  createFacturacion,
  eliminarFacturacion,
  getFacturacion,
  getFacturaciones,
  getFacturasPorRangoDeFechas,
} from "../controllers/facturacionAccesorios.controllers.js";

const router = Router();

router.get("/facturacion-accesorios", isAuth, getFacturaciones);

router.get("/facturacion-accesorios/:id", isAuth, getFacturacion);

router.post("/facturacion-accesorios", isAuth, createFacturacion);

router.put("/facturacion-accesorios/:id", isAuth, actualizarFacturacion);

router.delete("/facturacion-accesorios/:id", isAuth, eliminarFacturacion);

router.post("/facturas-rango-fechas", isAuth, getFacturasPorRangoDeFechas);

export default router;
