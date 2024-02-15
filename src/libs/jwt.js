import jwt from "jsonwebtoken";

export const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, "react2021", (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};
