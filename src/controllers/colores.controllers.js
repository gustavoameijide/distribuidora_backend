import { pool } from "../db.js";

export const getColores = async (req, res, next) => {
  //obtener perfiles
  const result = await pool.query("SELECT * FROM colores WHERE user_id = $1", [
    req.userId,
  ]);
  return res.json(result.rows);
};

export const getColor = async (req, res) => {
  const result = await pool.query("SELECT * FROM colores WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun color con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const crearColores = async (req, res, next) => {
  const { color } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO colores (color,user_id) VALUES ($1, $2) RETURNING *",
      [color, req.userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un color con ese nombre",
      });
    }
    next(error);
  }
};

export const actualizarColores = async (req, res) => {
  const id = req.params.id;
  const { color } = req.body;

  const result = await pool.query(
    "UPDATE colores SET color = $1 WHERE id = $2",
    [color, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun color con ese id",
    });
  }

  return res.json({
    message: "Color actualizado",
  });
};

export const eliminarColor = async (req, res) => {
  const result = await pool.query("DELETE FROM colores WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun color con ese id",
    });
  }

  return res.sendStatus(204);
};
