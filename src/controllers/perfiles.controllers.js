import { pool } from "../db.js";

export const getPerfiles = async (req, res, next) => {
  //obtener perfiles
  const result = await pool.query("SELECT * FROM perfiles WHERE user_id = $1", [
    req.userId,
  ]);
  return res.json(result.rows);
};

export const getPerfil = async (req, res) => {
  const result = await pool.query("SELECT * FROM perfiles WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe una tarea con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const createPerfil = async (req, res, next) => {
  const { nombre, color, descripcion, categoria, peso_neto_barra_6mts, stock } =
    req.body;

  try {
    // Generar un ID aleatorio
    const randomId = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000); // Rango: 100000 a 999999

    // Insertar un nuevo perfil en la base de datos con el ID aleatorio
    const result = await pool.query(
      "INSERT INTO perfiles (id, nombre, color, descripcion, categoria, peso_neto_barra_6mts, stock, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        randomId,
        nombre,
        color,
        descripcion,
        categoria,
        peso_neto_barra_6mts,
        stock,
        req.userId,
      ]
    );

    // Obtener todas las categorías después de la inserción
    const allPerfiles = await pool.query("SELECT * FROM perfiles");

    res.json(allPerfiles.rows); // Devolver todas las categorías
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un perfil así!",
      });
    }
    next(error);
  }
};

export const actualizarPerfil = async (req, res) => {
  const id = req.params.id;
  const { nombre, color, descripcion, categoria, peso_neto_barra_6mts, stock } =
    req.body;

  const result = await pool.query(
    "UPDATE perfiles SET nombre = $1, color = $2 ,stock = $3, peso_neto_barra_6mts = $4, categoria = $5, descripcion = $6 WHERE id = $7",
    [nombre, color, stock, peso_neto_barra_6mts, categoria, descripcion, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe un perfil con ese id",
    });
  }

  // Obtener todas las categorías después de la inserción
  const allPerfiles = await pool.query("SELECT * FROM perfiles");

  res.json(allPerfiles.rows); // Devolver todas las categorías
};

export const eliminarPerfil = async (req, res) => {
  const result = await pool.query("DELETE FROM perfiles WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun perfil con ese id",
    });
  }

  // Obtener todas las categorías después de la inserción
  const allPerfiles = await pool.query("SELECT * FROM perfiles");

  res.json(allPerfiles.rows); // Devolver todas las categorías
};

export const actualizarPerfilUnico = async (req, res) => {
  const id = req.params.id;
  let { cantidad } = req.body;

  // Asegurarse de que la cantidad sea un número
  cantidad = parseFloat(cantidad);

  try {
    // Obtener el stock actual del perfil
    const perfilActual = await pool.query(
      "SELECT stock FROM perfiles WHERE id = $1",
      [id]
    );

    if (perfilActual.rowCount === 0 && id) {
      return res.status(404).json({
        message: "No existe un perfil con ese id",
      });
    }

    const stockActual = perfilActual.rows[0]?.stock || 0;

    // Validar que la cantidad no sea mayor que el stock actual
    if (cantidad > stockActual && id) {
      return res.status(400).json({
        message: "La cantidad no puede ser mayor que el stock actual",
      });
    }

    // Verificar que la cantidad de stock después de la actualización no sea menor que cero
    if (stockActual - cantidad < 0) {
      return res.status(400).json({
        message: "La actualización resultaría en un stock menor que cero",
      });
    }

    // Realizar la actualización en la base de datos
    const result = await pool.query(
      id
        ? "UPDATE perfiles SET stock = stock - $1 WHERE id = $2"
        : "INSERT INTO perfiles (stock) VALUES ($1) RETURNING id",
      [cantidad, id]
    );

    if (result.rowCount === 0 && id) {
      return res.status(404).json({
        message: "No existe un perfil con ese id",
      });
    }

    return res.json({
      message: id ? "Stock actualizado" : "Producto creado",
    });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const alEliminarProductoSumarStock = async (req, res) => {
  const id = req.params.id;
  const { cantidad } = req.body;

  const result = await pool.query(
    "UPDATE perfiles SET stock = stock + $1 WHERE id = $2",
    [cantidad, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe un perfil con ese id",
    });
  }

  return res.json({
    message: "Stock actualizado",
  });
};
