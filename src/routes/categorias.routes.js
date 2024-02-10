import Router from "express-promise-router";
import {
  actualizarCategoria,
  createCategoria,
  eliminarCategoria,
  getCategoria,
  getCategorias,
} from "../controllers/categorias.controllers.js";
import { isAuth } from "../middlewares/auth.middleware.js";
// import { validateSchema } from "../middlewares/validate.middleware.js";
// import {
//   createPerfilSchema,
//   updatePerfilSchema,
// } from "../schemas/aluminio.schema.js";

const router = Router();

router.get("/categorias", isAuth, getCategorias);

router.get("/categorias/:id", isAuth, getCategoria);

router.post("/categorias", isAuth, createCategoria);

router.put("/categorias/:id", isAuth, actualizarCategoria);

router.delete("/categorias/:id", isAuth, eliminarCategoria);

export default router;
