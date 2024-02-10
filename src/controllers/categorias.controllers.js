import { pool } from "../db.js";

export const getCategorias = async (req, res, next) => {
  //obtener perfiles
  const result = await pool.query(
    "SELECT * FROM categorias WHERE user_id = $1",
    [req.userId]
  );
  return res.json(result.rows);
};

export const getCategoria = async (req, res) => {
  const result = await pool.query("SELECT * FROM categorias WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe una categoria con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const createCategoria = async (req, res, next) => {
  const { categoria } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO categorias (categoria,user_id) VALUES ($1, $2) RETURNING *",
      [categoria, req.userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una categoria con ese nombre",
      });
    }
    next(error);
  }
};

export const actualizarCategoria = async (req, res) => {
  const id = req.params.id;
  const { categoria } = req.body;

  const result = await pool.query(
    "UPDATE categorias SET categoria = $1 WHERE id = $2",
    [categoria, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna categoria con ese id",
    });
  }

  return res.json({
    message: "Categoria actualizada",
  });
};

export const eliminarCategoria = async (req, res) => {
  const result = await pool.query("DELETE FROM categorias WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna categoria con ese id",
    });
  }

  return res.sendStatus(204);
};
