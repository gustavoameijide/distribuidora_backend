import { pool } from "../db.js";
import { createAccessToken } from "../libs/jwt.js";
import bcrypt from "bcrypt";
import md5 from "md5";

//login
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

//registro
export const signup = async (req, res, next) => {
  //registrar cliente
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const gravatar = `https://www.gravatar.com/avatar/${md5(email)}`;

    const result = await pool.query(
      "INSERT INTO users(username,password,email,gravatar) VALUES($1,$2,$3,$4) RETURNING *",
      [username, hashedPassword, email, gravatar]
    );

    const token = await createAccessToken({ id: result.rows[0].id });

    res.cookie("token", token, {
      // httpOnly: true,
      // secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "El correo ya esta registrado",
      });
    }

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
