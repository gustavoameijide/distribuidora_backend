import { pool } from "../db.js";

// Obtener todos los accesorios
export const getAccesorios = async (req, res, next) => {
  const result = await pool.query(
    "SELECT * FROM accesorios WHERE user_id = $1",
    [req.userId]
  );
  return res.json(result.rows);
};

// Obtener un accesorio por su ID
export const getAccesorio = async (req, res) => {
  const result = await pool.query("SELECT * FROM accesorios WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe un accesorio con ese id",
    });
  }

  return res.json(result.rows[0]);
};

// Crear un nuevo accesorio
export const createAccesorio = async (req, res, next) => {
  const { codigo, descripcion, stock } = req.body;

  try {
    // Generar un ID aleatorio para el accesorio
    // const randomId = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);

    // Insertar un nuevo accesorio en la base de datos
    const result = await pool.query(
      "INSERT INTO accesorios ( codigo, descripcion, stock, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [codigo, descripcion, stock, req.userId]
    );

    // Obtener todos los accesorios después de la inserción
    const allAccesorios = await pool.query("SELECT * FROM accesorios");

    res.json(allAccesorios.rows); // Devolver todos los accesorios
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un accesorio con ese código!",
      });
    }
    next(error);
  }
};

// Actualizar un accesorio existente
export const actualizarAccesorio = async (req, res) => {
  const id = req.params.id;
  const { codigo, descripcion, stock } = req.body;

  const result = await pool.query(
    "UPDATE accesorios SET codigo = $1, descripcion = $2, stock = $3 WHERE id = $4",
    [codigo, descripcion, stock, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe un accesorio con ese id",
    });
  }

  // Obtener todos los accesorios después de la actualización
  const allAccesorios = await pool.query("SELECT * FROM accesorios");

  res.json(allAccesorios.rows); // Devolver todos los accesorios
};

// Eliminar un accesorio
export const eliminarAccesorio = async (req, res) => {
  const result = await pool.query("DELETE FROM accesorios WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningún accesorio con ese id",
    });
  }

  // Obtener todos los accesorios después de la eliminación
  const allAccesorios = await pool.query("SELECT * FROM accesorios");

  res.json(allAccesorios.rows); // Devolver todos los accesorios
};

// Actualizar el stock de un accesorio específico
export const actualizarStockAccesorio = async (req, res) => {
  const id = req.params.id;
  let { cantidad } = req.body;

  // Asegurarse de que la cantidad sea un número
  cantidad = parseFloat(cantidad);

  try {
    // Obtener el stock actual del accesorio
    const accesorioActual = await pool.query(
      "SELECT stock FROM accesorios WHERE id = $1",
      [id]
    );

    if (accesorioActual.rowCount === 0) {
      return res.status(404).json({
        message: "No existe un accesorio con ese id",
      });
    }

    const stockActual = accesorioActual.rows[0]?.stock || 0;

    // Validar que la cantidad no sea mayor que el stock actual
    if (cantidad > stockActual) {
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
      "UPDATE accesorios SET stock = stock - $1 WHERE id = $2",
      [cantidad, id]
    );

    return res.json({
      message: "Stock actualizado",
    });
  } catch (error) {
    console.error("Error al actualizar el stock del accesorio:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
