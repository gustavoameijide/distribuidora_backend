import Router from "express-promise-router";
import {
  changePassword,
  // passwordReset,
  profile,
  signin,
  signout,
  signup,
} from "../controllers/auth.controllers.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";
import { signinSchema, signupSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/signin", validateSchema(signinSchema), signin);

router.post("/signup", validateSchema(signupSchema), signup);

router.post("/signout", signout);

//router.put("/signin/:id", validateSchema(passwordSchema), passwordReset);

router.get("/profile", isAuth, profile);

router.post("/change-password", changePassword);

export default router;
