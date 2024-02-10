import { pool } from "../db.js";

//obtener presupuestos
export const getDatosFacturaciones = async (req, res, next) => {
  const result = await pool.query(
    "SELECT * FROM datos_facturacion WHERE user_id = $1",
    [req.userId]
  );
  return res.json(result.rows);
};

//obtener presupuesto
export const getDatosFacturacion = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM datos_facturacion WHERE id = $1",
    [req.params.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun dato con ese id",
    });
  }

  return res.json(result.rows[0]);
};

//crear presupuesto
export const createDatoFacturacion = async (req, res, next) => {
  const { nombre, email, detalle, telefono, direccion, localidad } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO datos_facturacion (nombre, email, detalle, telefono, direccion, localidad, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [nombre, email, detalle, telefono, direccion, localidad, req.userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un dato con ese id",
      });
    }
    next(error);
  }
};

//actualizar cliente
export const actualizarDatoFacturacion = async (req, res) => {
  const id = req.params.id;
  const { nombre, email, detalle, telefono, direccion, localidad } = req.body;

  const result = await pool.query(
    "UPDATE datos_facturacion SET nombre = $1, email = $2, detalle = $3 , telefono = $4 , direccion = $5, localidad = $6 WHERE id = $7",
    [nombre, email, detalle, telefono, direccion, localidad, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun dato con ese id",
    });
  }

  return res.json({
    message: "Datos actualizados",
  });
};

//actualizar eliminar
export const eliminarDatoFacturacion = async (req, res) => {
  const result = await pool.query(
    "DELETE FROM datos_facturacion WHERE id = $1",
    [req.params.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun dato con ese id",
    });
  }

  return res.sendStatus(204);
};
