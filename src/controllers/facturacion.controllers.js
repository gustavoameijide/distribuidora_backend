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
  const {
    clientes,
    productos,
    estadistica,
    estado,
    tipo_factura,
    iva_total,
    punto,
  } = req.body;

  let clienteProducts; // Array para almacenar los IDs de los productos vendidos

  try {
    // Iniciar una transacción
    await pool.query("BEGIN");

    // Insertar la facturación en la tabla facturacion
    const result = await pool.query(
      "INSERT INTO facturacion (clientes, productos, estadistica, estado, tipo_factura, iva_total, punto, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        JSON.stringify(clientes),
        JSON.stringify(productos),
        JSON.stringify(estadistica),
        estado,
        tipo_factura,
        iva_total,
        punto,
        req.userId,
      ]
    );

    // Obtener los IDs de los productos vendidos desde la solicitud
    clienteProducts = productos?.respuesta?.map((producto) => producto.id);

    // Construir y ejecutar la consulta de actualización para cada producto vendido
    for (const producto of productos.respuesta) {
      if (punto === "venta") {
        const updateQuery = `
          UPDATE perfiles
          SET stock = stock - $1
          WHERE id = $2
        `;
        await pool.query(updateQuery, [producto.barras, producto.id]);
      }
    }

    // Actualizar deuda_restante en la tabla clientes si es punto de venta
    if (punto === "venta") {
      const { total_pagar } = estadistica;
      const { id } = clientes;

      const updateDeudaQuery = `
        UPDATE clientes
        SET deuda_restante = deuda_restante + $1
        WHERE id = $2
      `;
      await pool.query(updateDeudaQuery, [total_pagar, id]);
    }

    // Confirmar la transacción
    await pool.query("COMMIT");

    // Obtener todas las facturas actualizadas
    const allFacturas = await pool.query("SELECT * FROM facturacion");
    const allClientes = await pool.query("SELECT * FROM clientes");
    const allProductos = await pool.query("SELECT * FROM perfiles");

    // Enviar respuesta con las facturas actualizadas
    res.json({
      facturas: allFacturas.rows,
      clientes: allClientes.rows,
      productos: allProductos.rows,
    });
  } catch (error) {
    // Revertir la transacción si hay un error
    await pool.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una factura con ese id",
      });
    }
    next(error);
  }
};

//actualizar venta/pre
export const actualizarFacturacion = async (req, res, next) => {
  const idFactura = req.params.id; // Obtener el id de la factura de req.params
  const {
    clientes,
    productos,
    estadistica,
    estado,
    tipo_factura,
    iva_total,
    punto,
  } = req.body;

  let clienteProducts; // Array para almacenar los IDs de los productos vendidos

  try {
    // Iniciar una transacción
    await pool.query("BEGIN");

    // Verificar si la factura con el ID proporcionado existe
    const existingFactura = await pool.query(
      "SELECT * FROM facturacion WHERE id = $1 FOR UPDATE",
      [idFactura]
    );

    if (existingFactura.rows.length === 0) {
      return res.status(404).json({
        message: "No se encontró ninguna factura con el ID proporcionado",
      });
    }

    // Actualizar la facturación en la tabla facturacion
    const result = await pool.query(
      "UPDATE facturacion SET clientes = $1, productos = $2, estadistica = $3, estado = $4, tipo_factura = $5, iva_total = $6, punto = $7 WHERE id = $8 RETURNING *",
      [
        JSON.stringify(clientes),
        JSON.stringify(productos),
        JSON.stringify(estadistica),
        estado,
        tipo_factura,
        iva_total,
        punto,
        idFactura,
      ]
    );

    // Obtener los IDs de los productos vendidos desde la solicitud
    clienteProducts = productos?.respuesta?.map((producto) => producto.id);

    // Construir y ejecutar la consulta de actualización para cada producto vendido
    for (const producto of productos.respuesta) {
      if (punto === "venta") {
        const updateQuery = `
          UPDATE perfiles
          SET stock = stock - $1
          WHERE id = $2
        `;
        await pool.query(updateQuery, [producto.barras, producto.id]);
      }
    }

    // Actualizar deuda_restante en la tabla clientes si es punto de venta
    if (punto === "venta") {
      const { total_pagar } = estadistica;
      const { id } = clientes;

      const updateDeudaQuery = `
        UPDATE clientes
        SET deuda_restante = deuda_restante + $1
        WHERE id = $2
      `;
      await pool.query(updateDeudaQuery, [total_pagar, id]);
    }

    // Confirmar la transacción
    await pool.query("COMMIT");

    // Obtener todas las facturas actualizadas
    const allFacturas = await pool.query("SELECT * FROM facturacion");
    const allClientes = await pool.query("SELECT * FROM clientes");
    const allProductos = await pool.query("SELECT * FROM perfiles");

    // Enviar respuesta con las facturas actualizadas
    res.json({
      facturas: allFacturas.rows,
      clientes: allClientes.rows,
      productos: allProductos.rows,
    });
  } catch (error) {
    // Revertir la transacción si hay un error
    await pool.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe una factura con ese id",
      });
    }
    next(error);
  }
};

// //actualizar cliente
// export const actualizarFacturacion = async (req, res) => {
//   const id = req.params.id;
//   const { estado } = req.body;

//   const result = await pool.query(
//     "UPDATE facturacion SET estado = $1 WHERE id = $2",
//     [estado, id]
//   );

//   if (result.rowCount === 0) {
//     return res.status(404).json({
//       message: "No existe ninguna factura con ese id",
//     });
//   }

//   return res.json({
//     message: "Factura actualizado",
//   });
// };

export const eliminarFacturacion = async (req, res, next) => {
  const idFactura = req.params.id;

  try {
    // Iniciar una transacción
    await pool.query("BEGIN");

    // Verificar si la factura con el ID proporcionado existe y obtener los datos necesarios
    const facturaResult = await pool.query(
      "SELECT * FROM facturacion WHERE id = $1 FOR UPDATE",
      [idFactura]
    );

    if (facturaResult.rows.length === 0) {
      return res.status(404).json({
        message: "No se encontró ninguna factura con el ID proporcionado",
      });
    }

    const { clientes, productos, estadistica, punto } = facturaResult.rows[0];

    // Eliminar la facturación de la tabla facturacion
    await pool.query("DELETE FROM facturacion WHERE id = $1", [idFactura]);

    // Actualizar deuda_restante en la tabla clientes si es punto de venta
    if (punto === "venta") {
      const { total_pagar } = estadistica;
      const { id } = clientes;

      const updateDeudaQuery = `
        UPDATE clientes
        SET deuda_restante = deuda_restante - $1
        WHERE id = $2
      `;
      await pool.query(updateDeudaQuery, [total_pagar, id]);
    }

    // Actualizar stock en la tabla perfiles
    for (const producto of productos.respuesta) {
      if (punto === "venta") {
        const updateStockQuery = `
          UPDATE perfiles
          SET stock = stock + $1
          WHERE id = $2
        `;
        await pool.query(updateStockQuery, [producto.barras, producto.id]);
      }
    }

    // Confirmar la transacción
    await pool.query("COMMIT");

    // Obtener todas las facturas actualizadas
    const allFacturas = await pool.query("SELECT * FROM facturacion");
    const allClientes = await pool.query("SELECT * FROM clientes");
    const allProductos = await pool.query("SELECT * FROM perfiles");

    // Enviar respuesta con las facturas actualizadas
    res.json({
      facturas: allFacturas.rows,
      clientes: allClientes.rows,
      productos: allProductos.rows,
    });
  } catch (error) {
    // Revertir la transacción si hay un error
    await pool.query("ROLLBACK");

    next(error);
  }
};

export const getFacturasPorRangoDeFechas = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.body;

    // Validación de fechas
    if (
      !fechaInicio ||
      !fechaFin ||
      !isValidDate(fechaInicio) ||
      !isValidDate(fechaFin)
    ) {
      return res.status(400).json({ message: "Fechas inválidas" });
    }

    // Función de validación de fecha
    function isValidDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return dateString.match(regex) !== null;
    }

    // Ajuste de zona horaria UTC
    const result = await pool.query(
      "SELECT * FROM facturacion WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at",
      [fechaInicio, fechaFin]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener salidas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
