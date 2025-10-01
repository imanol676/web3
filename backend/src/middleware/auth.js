import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Token no proporcionado",
      message: "Se requiere autenticación",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expirado",
        message: "Por favor, vuelve a autenticarte",
      });
    }

    return res.status(403).json({
      error: "Token inválido",
      message: "El token proporcionado no es válido",
    });
  }
};

export const validateAddressOwnership = (req, res, next) => {
  const { address } = req.params;
  const tokenAddress = req.user.address;

  if (address.toLowerCase() !== tokenAddress.toLowerCase()) {
    return res.status(403).json({
      error: "Acceso denegado",
      message: "No puedes acceder a información de otra dirección",
    });
  }

  next();
};
