import Router from "express-promise-router";
import {
  actualizarCliente,
  createCliente,
  eliminarCliente,
  getClientes,
  getCliente,
  actualizarClienteFacturacion,
  actualizarClienteEntrega,
  resetearCamposCliente,
  crearPago,
} from "../controllers/clientes.controllers.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/clientes", isAuth, getClientes);

router.get("/clientes/:id", isAuth, getCliente);

router.post("/clientes", isAuth, createCliente);

router.put("/clientes/:id", isAuth, actualizarCliente);

router.put("/cliente-entrega/:id", isAuth, actualizarClienteEntrega);

router.put("/clientes/facturacion/:id", isAuth, actualizarClienteFacturacion);

router.put("/clientes/resetear/:id", isAuth, resetearCamposCliente);

router.delete("/clientes/:id", isAuth, eliminarCliente);

router.post("/clientes/:id/comprobantes", isAuth, crearPago);

export default router;
