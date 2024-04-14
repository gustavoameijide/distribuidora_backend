import { pool } from "../db.js";
import { createAccessToken } from "../libs/jwt.js";
import bcrypt from "bcrypt";
import md5 from "md5";

//login
// export const signin = async (req, res) => {
//   const { email, password } = req.body;

//   const result = await pool.query("SELECT * FROM users WHERE email = $1", [
//     email,
//   ]);
//   if (result.rowCount === 0) {
//     return res.status(400).json({
//       message: "EL correo no esta registrado",
//     });
//   }

//   const validPassword = await bcrypt.compare(password, result.rows[0].password);
//   if (!validPassword) {
//     return res.status(400).json({
//       message: "La contraseña es incorrecta",
//     });
//   }
//   const token = await createAccessToken({ id: result.rows[0].id });

//   res.cookie("token", token, {
//     // httpOnly: true,
//     // secure: true,
//     sameSite: "none",
//     maxAge: 24 * 60 * 60 * 1000,
//   });

//   return res.json(result.rows[0]);
// };

export const signin = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (result.rowCount === 0) {
    return res.status(400).json({
      message: "EL correo no esta registrado",
    });
  }

  const validPassword = await bcrypt.compare(password, result.rows[0].password);
  if (!validPassword) {
    return res.status(400).json({
      message: "La contraseña es incorrecta",
    });
  }
  const token = await createAccessToken({ id: result.rows[0].id });

  res.cookie("token", token, {
    // httpOnly: true,
    // secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json(result.rows[0]);
};

// login
// export const signin = async (req, res) => {
//   const { email, password } = req.body;

//   const result = await pool.query("SELECT * FROM users WHERE email = $1", [
//     email,
//   ]);
//   if (result.rowCount === 0) {
//     return res.status(400).json({
//       message: "El correo no está registrado",
//     });
//   }

//   const validPassword = await bcrypt.compare(password, result.rows[0].password);
//   if (!validPassword) {
//     return res.status(400).json({
//       message: "La contraseña es incorrecta",
//     });
//   }

//   // Verificar si el usuario tiene pago activo y está dentro del período de prueba
//   req.user = { id: result.rows[0].id }; // Agrega el usuario al objeto de solicitud
//   checkPago(req, res, async () => {
//     const currentDate = new Date();
//     const startDate = new Date(result.rows[0].fecha_inicio_prueba); // Reemplaza con el nombre correcto de tu columna de fecha de inicio de prueba

//     // Comprueba si el usuario está dentro del período de prueba de 14 días
//     const daysInTrial = 14;
//     const millisecondsInDay = 24 * 60 * 60 * 1000;
//     const trialPeriodEnd =
//       startDate.getTime() + daysInTrial * millisecondsInDay;

//     if (currentDate.getTime() > trialPeriodEnd) {
//       // Período de prueba ha expirado, denegar acceso
//       return res.status(403).json({
//         message: "Período de prueba expirado. Realiza el pago para continuar.",
//       });
//     }

//     // Usuario con pago activo y dentro del período de prueba, generar token de acceso
//     const token = await createAccessToken({ id: result.rows[0].id });

//     res.cookie("token", token, {
//       sameSite: "none",
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     return res.json(result.rows[0]);
//   });
// };

//registro
// export const signup = async (req, res, next) => {
//   //registrar cliente
//   const { username, email, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const gravatar = `https://www.gravatar.com/avatar/${md5(email)}`;

//     const result = await pool.query(
//       "INSERT INTO users(username,password,email,gravatar) VALUES($1,$2,$3,$4) RETURNING *",
//       [username, hashedPassword, email, gravatar]
//     );

//     const token = await createAccessToken({ id: result.rows[0].id });

//     res.cookie("token", token, {
//       // httpOnly: true,
//       // secure: true,
//       sameSite: "none",
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     return res.json(result.rows[0]);
//   } catch (error) {
//     if (error.code === "23505") {
//       return res.status(400).json({
//         message: "El correo ya esta registrado",
//       });
//     }

//     next(error);
//   }
// };

export const signup = async (req, res, next) => {
  // Registrar cliente
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const gravatar = `https://www.gravatar.com/avatar/${md5(email)}`;

    // Insertar nuevo usuario
    const userResult = await pool.query(
      "INSERT INTO users(username, password, email, gravatar) VALUES($1, $2, $3, $4) RETURNING id",
      [username, hashedPassword, email, gravatar]
    );

    const userId = userResult.rows[0].id;

    // Actualizar la columna "pago" a true para el nuevo usuario en la tabla "pago"
    await pool.query("INSERT INTO pago(user_id, pago) VALUES($1, $2)", [
      userId,
      true,
    ]);

    // Crear token de acceso
    const token = await createAccessToken({ id: userId });

    // Establecer la cookie con el token
    res.cookie("token", token, {
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ id: userId, username, email, gravatar, pago: true });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    next(error);
  }
};

// Middleware para verificar el estado del pago antes de permitir el acceso
export const checkPago = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT pago FROM pago WHERE user_id = $1",
      [userId]
    );

    console.log("Result from database:", result.rows);

    if (result.rows.length > 0 && result.rows[0].pago) {
      // El usuario tiene pago activo, permitir el acceso
      return next();
    } else {
      // Verificar si se está realizando un proceso de pago desde la aplicación
      if (req.query.payProcess === "true") {
        console.log("Access granted for payment process.");
        return next();
      } else {
        console.log("Access denied. Payment not active.");
        return res.status(403).json({
          message: "Acceso denegado. Realiza el pago para activar tu cuenta.",
        });
      }
    }
  } catch (error) {
    console.error("Error in checkPago middleware:", error);
    next(error);
  }
};

//logout
export const signout = (req, res) => {
  res.clearCookie("token");
  res.sendStatus(200);
};

//profile user
export const profile = async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    req.userId,
  ]);
  return res.json(result.rows[0]);
};

//profile user
export const passwordReset = async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    req.userId,
  ]);
  return res.json(result.rows[0]);
};

export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Validar si el correo electrónico está presente
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "El correo electrónico es inválido",
      });
    }

    // Validar si la antigua contraseña está presente
    if (!oldPassword || typeof oldPassword !== "string") {
      return res.status(400).json({
        message: "La antigua contraseña es inválida",
      });
    }

    // Validar si la nueva contraseña está presente
    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({
        message: "La nueva contraseña es inválida",
      });
    }

    // Buscar al usuario por su correo electrónico y antigua contraseña
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, oldPassword]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        message: "La autenticación ha fallado. Verifica tus credenciales.",
      });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2 RETURNING *",
      [hashedPassword, email]
    );

    // Devolver la información actualizada del usuario
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al cambiar la contraseña", error);
    return res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
};
