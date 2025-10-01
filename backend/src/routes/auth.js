import express from "express";
import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";

const router = express.Router();

const pendingMessages = new Map();

router.post("/message", async (req, res) => {
  try {
    const { address } = req.body;

    console.log(" Solicitud de mensaje SIWE para:", address);

    if (!address) {
      return res.status(400).json({
        error: "Dirección requerida",
        message: "Debes proporcionar una dirección de wallet",
      });
    }

    const domain = req.headers.host || "localhost:3001";
    const origin = req.headers.origin || `http://${req.headers.host}`;

    const siweMessageData = {
      domain: domain,
      address: address,
      statement: "Sign in to Faucet DApp",
      uri: origin,
      version: "1",
      chainId: 11155111,
      nonce: generateNonce(),
    };

    console.log(" Datos del mensaje SIWE:", siweMessageData);

    const message = new SiweMessage(siweMessageData);
    const messageString = message.prepareMessage();

    console.log("📄 Mensaje preparado:", messageString);

    console.log("✅ Mensaje SIWE generado exitosamente");

    pendingMessages.set(address.toLowerCase(), {
      message: messageString,
      siweMessage: message,
      timestamp: Date.now(),
    });

    cleanExpiredMessages();

    res.json({
      message: messageString,
      address,
    });
  } catch (error) {
    console.error("Error generando mensaje SIWE:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo generar el mensaje de autenticación",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { message, signature } = req.body;

    if (!message || !signature) {
      return res.status(400).json({
        error: "Datos incompletos",
        message: "Se requieren el mensaje y la firma",
      });
    }

    const siweMessage = new SiweMessage(message);

    const address = siweMessage.address.toLowerCase();
    const pending = pendingMessages.get(address);

    if (!pending) {
      return res.status(401).json({
        error: "Mensaje no encontrado",
        message: "Debes solicitar un mensaje de autenticación primero",
      });
    }

    const messageAge = Date.now() - pending.timestamp;
    if (messageAge > 10 * 60 * 1000) {
      pendingMessages.delete(address);
      return res.status(401).json({
        error: "Mensaje expirado",
        message: "El mensaje de autenticación ha expirado. Solicita uno nuevo",
      });
    }

    const fields = await siweMessage.verify({ signature });

    if (!fields.success) {
      return res.status(401).json({
        error: "Firma inválida",
        message: "La firma no pudo ser verificada",
      });
    }

    pendingMessages.delete(address);

    const token = jwt.sign(
      { address: siweMessage.address },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      address: siweMessage.address,
      message: "Autenticación exitosa",
    });
  } catch (error) {
    console.error("Error verificando firma SIWE:", error);
    res.status(401).json({
      error: "Error de autenticación",
      message: error.message || "No se pudo verificar la firma",
    });
  }
});

router.get("/verify", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      valid: true,
      address: decoded.address,
    });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

function generateNonce() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function cleanExpiredMessages() {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;

  for (const [address, data] of pendingMessages.entries()) {
    if (now - data.timestamp > tenMinutes) {
      pendingMessages.delete(address);
    }
  }
}

export default router;
