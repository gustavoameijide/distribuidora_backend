import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  actualizarFacturacion,
  createFacturacion,
  eliminarFacturacion,
  getFacturacion,
  getFacturaciones,
  getFacturacionesPorMesActual,
  getFacturasPorRangoDeFechas,
} from "../controllers/facturacion.controllers.js";

const router = Router();

router.get("/facturacion", isAuth, getFacturaciones);

router.get("/facturacion/:id", isAuth, getFacturacion);

router.post("/facturacion", isAuth, createFacturacion);

router.put("/facturacion/:id", isAuth, actualizarFacturacion);

router.delete("/facturacion/:id", isAuth, eliminarFacturacion);

router.get("/facturacion-mes", isAuth, getFacturacionesPorMesActual);

router.post("/facturas-rango-fechas", isAuth, getFacturasPorRangoDeFechas);

export default router;
