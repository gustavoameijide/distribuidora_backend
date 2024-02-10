import { pool } from "../db.js";

export const getFacturaciones = async (req, res, next) => {
  const result = await pool.query(
    "SELECT * FROM facturacion WHERE user_id = $1",
    [req.userId]
  );
  return res.json(result.rows);
};

export const getFacturacionesPorMesActual = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM facturacion WHERE user_id = $1 AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)",
      [req.userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener facturaciones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getFacturacion = async (req, res) => {
  const result = await pool.query("SELECT * FROM facturacion WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun factura con ese id",
    });
  }

  return res.json(result.rows[0]);
};

export const createFacturacion = async (req, res, next) => {
  const { clientes, productos, estadistica, estado, tipo_factura, iva_total } =
    req.body;

  try {
    const result = await pool.query(
      "INSERT INTO facturacion (clientes, productos, estadistica, estado,tipo_factura,iva_total, user_id) VALUES ($1, $2, $3, $4,$5,$6,$7) RETURNING *",
      [
        clientes,
        productos,
        estadistica,
        estado,
        tipo_factura,
        iva_total,
        req.userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una factura con ese id",
      });
    }
    next(error);
  }
};

//actualizar cliente
export const actualizarFacturacion = async (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;

  const result = await pool.query(
    "UPDATE facturacion SET estado = $1 WHERE id = $2",
    [estado, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna factura con ese id",
    });
  }

  return res.json({
    message: "Factura actualizado",
  });
};

//actualizar eliminar
export const eliminarFacturacion = async (req, res) => {
  const result = await pool.query("DELETE FROM facturacion WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ninguna factura con ese id",
    });
  }

  return res.sendStatus(204);
};

export const actualizarCantidadPerfil = async (req, res) => {
  const productos = req.body.respuesta; // Access the 'respuesta' property from the request body

  try {
    await pool.query("BEGIN"); // Start a transaction

    // Update the stock for multiple products in the database
    await Promise.all(
      productos.map(async (producto) => {
        try {
          console.log(
            "Updating stock for:",
            producto.id,
            "Quantity:",
            producto.barras
          );

          // Get the current stock for the product
          const currentStockResult = await pool.query(
            "SELECT stock FROM perfiles WHERE id = $1",
            [producto.id]
          );

          const currentStock = currentStockResult.rows[0].stock;

          // Calculate the new stock after subtraction
          const newStock = currentStock - Number(producto.barras);

          // Update the stock in the database
          const updateResult = await pool.query(
            "UPDATE perfiles SET stock = $1 WHERE id = $2 RETURNING *",
            [newStock, producto.id]
          );

          console.log("Result:", updateResult.rows);
        } catch (updateError) {
          console.error(
            "Error updating stock for",
            producto.id,
            ":",
            updateError.message
          );
          throw updateError; // Re-throw the error to rollback the transaction
        }
      })
    );

    console.log("Request Payload:", { respuesta: productos });
    console.log("Request Body:", req.body);
    console.log("Update Result:", updateResult.rows);
    console.log("Rows Affected:", updateResult.rowCount);

    await pool.query("COMMIT"); // Commit the transaction

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    await pool.query("ROLLBACK"); // Rollback the transaction in case of an error
    console.error("Error updating stock:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
