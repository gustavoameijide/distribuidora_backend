import { pool } from "../db.js";

//obtener presupuestos
export const getPresupuestos = async (req, res, next) => {
  const result = await pool.query(
    "SELECT * FROM presupuesto WHERE user_id = $1",
    [req.userId]
  );
  return res.json(result.rows);
};

//obtener presupuesto
export const getPresupuesto = async (req, res) => {
  const result = await pool.query("SELECT * FROM presupuesto WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun presupuesto con ese id",
    });
  }

  return res.json(result.rows[0]);
};

//crear presupuesto
export const createPresupuesto = async (req, res, next) => {
  const { clientes, productos, estadistica, estado } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO presupuesto (clientes, productos, estadistica, estado, user_id) VALUES ($1, $2, $3, $4,$5) RETURNING *",
      [clientes, productos, estadistica, estado, req.userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un presupuesto con ese id",
      });
    }
    next(error);
  }
};

//actualizar cliente
export const actualizarPresupuesto = async (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;

  const result = await pool.query(
    "UPDATE presupuesto SET estado = $1 WHERE id = $2",
    [estado, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun presupuesto con ese id",
    });
  }

  return res.json({
    message: "Presupuesto actualizado",
  });
};

//actualizar eliminar
export const eliminarPresupuesto = async (req, res) => {
  const result = await pool.query("DELETE FROM presupuesto WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun presupuesto con ese id",
    });
  }

  return res.sendStatus(204);
};

//generar presupuesto factura
// export const facturaPresupuesto = async (req, res) => {
//   const result = await pool.query("SELECT * FROM presupuesto WHERE id = $1", [
//     req.params.id,
//   ]);

//   if (result.rowCount === 0) {
//     return res.status(404).json({
//       message: "No existe ningun presupuestro con ese id",
//     });
//   }

//   return res.json(result.rows[0]);
// };
