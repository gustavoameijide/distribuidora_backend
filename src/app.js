import express from "express";
import morgan from "morgan";
import perfilesRoutes from "./routes/perfiles.routes.js";
import authRoutes from "./routes/auth.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import presupuestoRoutes from "./routes/presupuestos.routes.js";
import datosFacturacionRoutes from "./routes/datosFacturacion.routes.js";
import facturacionRoutes from "./routes/facturacion.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import coloresRoutes from "./routes/colores.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";
import accesoriosRoutes from "./routes/accesorios.routes.js";
import facturacionAccesoriosRoutes from "./routes/facturacionAccesorios.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { ORIGIN } from "./config.js";

const app = express();

//middlewaress
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//routes
app.get("/", (req, res) => res.json({ message: "welcome to my API" }));
app.use("/api", perfilesRoutes);
app.use("/api", authRoutes);
app.use("/api", clientesRoutes);
app.use("/api", presupuestoRoutes);
app.use("/api", datosFacturacionRoutes);
app.use("/api", categoriasRoutes);
app.use("/api", coloresRoutes);
app.use("/api", facturacionRoutes);
app.use("/api", pagosRoutes);
app.use("/api", accesoriosRoutes);
app.use("/api", facturacionAccesoriosRoutes);

//error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

export default app;
