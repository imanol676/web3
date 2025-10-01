import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import faucetRoutes from "./routes/faucet.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de seguridad
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use("/auth", authRoutes);
app.use("/faucet", faucetRoutes);

// Ruta de health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Faucet Backend con Autenticación Web3",
    timestamp: new Date().toISOString(),
  });
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    name: "Faucet DApp Backend",
    version: "1.0.0",
    description: "Backend con autenticación Web3 (SIWE) para Faucet en Sepolia",
    endpoints: {
      auth: {
        "POST /auth/message": "Genera mensaje SIWE para firmar",
        "POST /auth/signin": "Verifica firma y genera JWT",
        "GET /auth/verify": "Verifica validez del JWT",
      },
      faucet: {
        "POST /faucet/claim": "Reclama tokens (requiere JWT)",
        "GET /faucet/status/:address": "Estado del usuario (requiere JWT)",
        "GET /faucet/info": "Información general del faucet",
      },
    },
  });
});

// Manejador de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint no encontrado",
    message: `La ruta ${req.method} ${req.path} no existe`,
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    error: "Error del servidor",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Ocurrió un error interno",
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
  console.log(` Conectado a Sepolia via ${process.env.RPC_URL}`);
  console.log(` Contrato: ${process.env.CONTRACT_ADDRESS}`);
  console.log(
    ` Frontend permitido: ${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }`
  );
});
