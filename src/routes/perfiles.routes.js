import Router from "express-promise-router";
import {
  actualizarPerfil,
  getPerfiles,
  getPerfil,
  eliminarPerfil,
  createPerfil,
  actualizarPerfilUnico,
  alEliminarProductoSumarStock,
} from "../controllers/perfiles.controllers.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";
import {
  createPerfilSchema,
  updatePerfilSchema,
} from "../schemas/aluminio.schema.js";

const router = Router();

router.get("/perfiles", isAuth, getPerfiles);

router.get("/perfiles/:id", isAuth, getPerfil);

router.post(
  "/perfiles",
  isAuth,
  validateSchema(createPerfilSchema),
  createPerfil
);

router.put("/perfiles/stock/:id", isAuth, actualizarPerfilUnico);

router.put(
  "/perfiles/eliminar-stock/:id",
  isAuth,
  alEliminarProductoSumarStock
);

router.put(
  "/perfiles/:id",
  isAuth,
  validateSchema(updatePerfilSchema),
  actualizarPerfil
);

router.delete("/perfiles/:id", isAuth, eliminarPerfil);

export default router;
