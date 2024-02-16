import jwt from "jsonwebtoken";

/*export const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, "react2021", (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};*/

export const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    const expiresIn = "10d"; // Set the expiration time to 10 days

    jwt.sign(payload, "react2021", { expiresIn }, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};
