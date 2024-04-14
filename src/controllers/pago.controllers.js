import { pool } from "../db.js";

export const getPagos = async (req, res, next) => {
  try {
    // Obtener la columna 'pago' para el usuario específico
    const result = await pool.query(
      "SELECT pago FROM pago WHERE user_id = $1",
      [
        req.userId, // Cambia a req.user.id si tu middleware de autenticación establece req.user
      ]
    );

    // Extraer solo la columna 'pago' de los resultados
    const pagos = result.rows.map((row) => row.pago);

    return res.json(pagos);
  } catch (error) {
    console.error("Error en getPagos:", error);
    next(error);
  }
};

export const realizarPago = async (req, res, next) => {
  try {
    // Obtener el ID de usuario desde la solicitud (puedes cambiarlo según tu implementación)
    const userId = req.userId; // Cambia a req.user.id si tu middleware de autenticación establece req.user

    // Actualizar la columna 'pago' a true para el usuario específico
    const updateResult = await pool.query(
      "UPDATE pago SET pago = true WHERE user_id = $1 RETURNING *",
      [userId]
    );

    if (updateResult.rows.length > 0) {
      // Actualización exitosa
      return res.json({
        success: true,
        message: "Pago realizado correctamente. ¡Bienvenido!",
      });
    } else {
      // No se encontró el usuario o no se pudo actualizar
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado o no se pudo realizar el pago.",
      });
    }
  } catch (error) {
    console.error("Error en realizarPago:", error);
    next(error);
  }
};
