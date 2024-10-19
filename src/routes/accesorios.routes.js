import Router from "express-promise-router";
import {
  actualizarAccesorio,
  getAccesorios,
  getAccesorio,
  eliminarAccesorio,
  createAccesorio,
  actualizarStockAccesorio,
  //   actualizarAccesorioUnico,
} from "../controllers/accesorios.controllers.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Get all accesorios
router.get("/accesorios", isAuth, getAccesorios);

// Get a specific accesorio by ID
router.get("/accesorios/:id", isAuth, getAccesorio);

// Create a new accesorio
router.post("/accesorios", isAuth, createAccesorio);

// Update stock of a specific accesorio by ID
router.put("/accesorios/stock/:id", isAuth, actualizarStockAccesorio);

// Update a specific accesorio by ID
router.put("/accesorios/:id", isAuth, actualizarAccesorio);

// Delete a specific accesorio by ID
router.delete("/accesorios/:id", isAuth, eliminarAccesorio);

export default router;
