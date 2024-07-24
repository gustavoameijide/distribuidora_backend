import { pool } from "../db.js";
import { v4 as uuidv4 } from "uuid";

//obtener clientes
export const getClientes = async (req, res, next) => {
  const result = await pool.query("SELECT * FROM clientes WHERE user_id = $1", [
    req.userId,
  ]);
  return res.json(result.rows);
};

//obtener Cliente
export const getCliente = async (req, res) => {
  const result = await pool.query("SELECT * FROM clientes WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun cliente con ese id",
    });
  }

  return res.json(result.rows[0]);
};

const generateUniqueId = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  const uniqueId = `${timestamp}${random}`;
  return uniqueId;
};

export const createCliente = async (req, res, next) => {
  const {
    nombre,
    apellido,
    email,
    telefono,
    domicilio,
    localidad,
    provincia,
    dni,
    deuda_restante,
  } = req.body;

  try {
    // Genera un ID único utilizando la función generateUniqueId
    const clienteId = generateUniqueId();

    const pagos = "[]";

    const result = await pool.query(
      "INSERT INTO clientes (id, nombre, apellido, email, telefono, domicilio, localidad, provincia, dni, deuda_restante, pagos, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
      [
        clienteId,
        nombre,
        apellido,
        email,
        telefono,
        domicilio,
        localidad,
        provincia,
        dni,
        deuda_restante,
        pagos,
        req.userId,
      ]
    );
    // Obtener todas las categorías después de la inserción
    const allClientes = await pool.query("SELECT * FROM clientes");

    res.json(allClientes.rows); // Devolver todas las categorías
  } catch (error) {
    console.log(error);
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Ya existe un cliente con ese nombre",
      });
    }
    next(error);
  }
};

//actualizar cliente
export const actualizarCliente = async (req, res) => {
  const id = req.params.id;
  const {
    nombre,
    apellido,
    email,
    telefono,
    domicilio,
    localidad,
    provincia,
    dni,
    deuda_restante,
  } = req.body;

  const result = await pool.query(
    "UPDATE clientes SET nombre = $1, apellido = $2 ,email = $3, telefono = $4, domicilio = $5, localidad = $6, provincia = $7, dni = $8, deuda_restante = $9 WHERE id = $10",
    [
      nombre,
      apellido,
      email,
      telefono,
      domicilio,
      localidad,
      provincia,
      dni,
      deuda_restante,
      id,
    ]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun cliente con ese id",
    });
  }

  // Obtener todas las categorías después de la inserción
  const allClientes = await pool.query("SELECT * FROM clientes");

  res.json(allClientes.rows); // Devolver todas las categorías
};

export const actualizarClienteFacturacion = async (req, res) => {
  const id = req.params.id;
  const { total_facturado, entrega, deuda_restante } = req.body;

  try {
    // Obtén los datos actuales del cliente
    const clienteActual = await pool.query(
      "SELECT total_facturado, entrega, deuda_restante FROM clientes WHERE id = $1",
      [id]
    );

    if (clienteActual.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún cliente con ese id",
      });
    }

    const {
      total_facturado: totalFacturadoActual,
      entrega: entregaActual,
      deuda_restante: deudaRestanteActual,
    } = clienteActual.rows[0];

    // Verifica que la entrega no sea mayor a la deuda restante
    if (entrega > deudaRestanteActual) {
      return res.status(400).json({
        message: "La entrega no puede ser mayor a la deuda restante",
      });
    }

    // Calcula los nuevos valores
    const nuevoTotalFacturado =
      parseFloat(totalFacturadoActual) + parseFloat(total_facturado);
    const nuevaEntrega = entregaActual + entrega;
    const nuevaDeudaRestante = deudaRestanteActual - entrega + total_facturado;

    // Actualiza la base de datos con los nuevos valores
    const resultadoUpdate = await pool.query(
      "UPDATE clientes SET total_facturado = $1, entrega = $2, deuda_restante = $3 WHERE id = $4",
      [nuevoTotalFacturado, nuevaEntrega, nuevaDeudaRestante, id]
    );

    if (resultadoUpdate.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún cliente con ese id",
      });
    }

    return res.json({
      message: "Cliente actualizado",
    });
  } catch (error) {
    console.error("Error al actualizar el cliente:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const actualizarClienteEntrega = async (req, res) => {
  const id = req.params.id;
  const entregaStr = req.body.entrega;

  // Verificar si la entrega es un número válido
  const entrega = Number(entregaStr);

  if (isNaN(entrega)) {
    return res.status(400).json({
      message: "La entrega no es un valor numérico válido",
    });
  }

  // Obtener la deuda_restante actual para el cliente especificado
  const clientResult = await pool.query(
    "SELECT deuda_restante FROM clientes WHERE id = $1",
    [id]
  );

  if (clientResult.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningún cliente con ese id",
    });
  }

  const currentDeudaRestante = clientResult.rows[0].deuda_restante;

  // Verificar si la entrega es mayor que la deuda_restante actual
  if (Number(entrega) > Number(currentDeudaRestante)) {
    return res.status(400).json({
      message: "La entrega no puede ser mayor a la deuda restante",
    });
  }

  // Calcular la nueva deuda_restante restando la cantidad entregada
  const newDeudaRestante = Number(currentDeudaRestante) - Number(entrega);

  // Actualizar la base de datos sumando la entrega al campo existente
  const result = await pool.query(
    "UPDATE clientes SET entrega = entrega + $1, deuda_restante = $2 WHERE id = $3",
    [entrega, newDeudaRestante, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningún cliente con ese id",
    });
  }

  return res.json({
    message: "Cliente actualizado",
  });
};

//actualizar eliminar
export const eliminarCliente = async (req, res) => {
  const result = await pool.query("DELETE FROM clientes WHERE id = $1", [
    req.params.id,
  ]);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "No existe ningun cliente con ese id",
    });
  }

  // Obtener todas las categorías después de la inserción
  const allClientes = await pool.query("SELECT * FROM clientes");

  res.json(allClientes.rows); // Devolver todas las categorías
};

export const resetearCamposCliente = async (req, res) => {
  const id = req.params.id;

  try {
    // Obtén los datos actuales del cliente
    const clienteActual = await pool.query(
      "SELECT total_facturado, entrega, deuda_restante FROM clientes WHERE id = $1",
      [id]
    );

    // Calcula los nuevos valores para restablecer a 0
    const nuevoTotalFacturado = 0;
    const nuevaEntrega = 0;
    const nuevaDeudaRestante = 0;

    // Actualiza la base de datos con los nuevos valores
    const resultadoUpdate = await pool.query(
      "UPDATE clientes SET total_facturado = $1, entrega = $2, deuda_restante = $3 WHERE id = $4",
      [nuevoTotalFacturado, nuevaEntrega, nuevaDeudaRestante, id]
    );

    if (resultadoUpdate.rowCount === 0) {
      return res.status(404).json({
        message: "No existe ningún cliente con ese id",
      });
    }

    // Obtener todas las categorías después de la inserción
    const allClientes = await pool.query("SELECT * FROM clientes");

    res.json(allClientes.rows); // Devolver todas las categorías
  } catch (error) {
    console.error("Error al resetear los campos del cliente:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const crearPago = async (req, res) => {
  const { id } = req.params; // ID del proveedor
  const { comprobante } = req.body; // Comprobante enviado desde el frontend

  try {
    // Generar un ID aleatorio usando uuid
    const comprobanteId = uuidv4();

    // Obtener la fecha actual
    const fechaActual = new Date().toISOString(); // Formato ISO 8601: 'YYYY-MM-DDTHH:mm:ss.sssZ'

    // Obtener el proveedor según el ID
    const proveedorResult = await pool.query(
      "SELECT * FROM clientes WHERE id = $1",
      [id]
    );

    if (proveedorResult.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró ningún proveedor con ese ID",
      });
    }

    let proveedor = proveedorResult.rows[0];

    // Obtener el arreglo de comprobantes actuales y agregar el nuevo comprobante
    let comprobantesArray = JSON.parse(proveedor.pagos || "[]");

    // Extraer el total del comprobante
    const totalComprobante = parseFloat(comprobante.total);

    // Sumar el total del comprobante al haber actual del proveedor
    const nuevoHaber = parseFloat(proveedor.deuda_restante) - totalComprobante;

    comprobantesArray.push({
      ...comprobante,
      id: comprobanteId,
      fecha: fechaActual,
    });

    // Actualizar el proveedor con el nuevo arreglo de comprobantes y el nuevo haber
    const result = await pool.query(
      "UPDATE clientes SET pagos = $1, deuda_restante = $2 WHERE id = $3 RETURNING *",
      [JSON.stringify(comprobantesArray), nuevoHaber, id]
    );

    proveedor = result.rows[0]; // Actualizar proveedor con los datos actualizados

    const allClientes = await pool.query("SELECT * FROM clientes");

    res.status(200).json({
      clienteActualizado: proveedor,
      todosLosClientes: allClientes.rows, // Opcional: puedes devolver todos los proveedores actualizados
    });
  } catch (error) {
    console.error("Error al crear comprobante:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
