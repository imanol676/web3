import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  claimTokensFromContract,
  hasAddressClaimedTokens,
  getBalanceOf,
  getAllUsers,
} from "../contract.js";

const router = express.Router();

/**
 * POST /faucet/claim
 * Permite al usuario reclamar tokens (requiere autenticación)
 */
router.post("/claim", authenticateToken, async (req, res) => {
  try {
    const { address } = req.user;

    console.log(`Usuario ${address} intentando reclamar tokens...`);

    // Verificar si ya reclamó tokens
    const hasClaimed = await hasAddressClaimedTokens(address);

    if (hasClaimed) {
      return res.status(400).json({
        success: false,
        error: "Ya reclamaste tokens",
        message: "Esta dirección ya ha reclamado sus tokens anteriormente",
      });
    }

    // Ejecutar la transacción en la blockchain
    const result = await claimTokensFromContract(address);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: "Error en la transacción",
        message:
          result.error ||
          "No se pudo completar la transacción en la blockchain",
      });
    }

    res.json({
      success: true,
      txHash: result.txHash,
      message: "Tokens reclamados exitosamente",
      explorer: `https://sepolia.etherscan.io/tx/${result.txHash}`,
    });
  } catch (error) {
    console.error("Error en /faucet/claim:", error);
    res.status(500).json({
      success: false,
      error: "Error del servidor",
      message: error.message || "Ocurrió un error al procesar la solicitud",
    });
  }
});

/**
 * GET /faucet/status/:address
 * Obtiene el estado del faucet para una dirección (requiere autenticación)
 */
router.get("/status/:address", authenticateToken, async (req, res) => {
  try {
    const { address } = req.params;
    const tokenAddress = req.user.address;

    // Verificar que el usuario solo pueda consultar su propia dirección
    if (address.toLowerCase() !== tokenAddress.toLowerCase()) {
      return res.status(403).json({
        error: "Acceso denegado",
        message: "Solo puedes consultar el estado de tu propia dirección",
      });
    }

    // Obtener información de la blockchain
    const [hasClaimed, balance, users] = await Promise.all([
      hasAddressClaimedTokens(address),
      getBalanceOf(address),
      getAllUsers(),
    ]);

    res.json({
      address,
      hasClaimed,
      balance: balance.toString(),
      totalUsers: users.length,
      users: users.slice(0, 10), // Limitar a los primeros 10 usuarios
    });
  } catch (error) {
    console.error("Error en /faucet/status:", error);
    res.status(500).json({
      error: "Error del servidor",
      message: error.message || "No se pudo obtener el estado del faucet",
    });
  }
});

/**
 * GET /faucet/info
 * Información general del faucet (público, no requiere autenticación)
 */
router.get("/info", async (req, res) => {
  try {
    const users = await getAllUsers();

    res.json({
      contractAddress: process.env.CONTRACT_ADDRESS,
      network: "Sepolia",
      chainId: 11155111,
      totalUsers: users.length,
      message: "Faucet DApp - Reclama tus tokens de prueba",
    });
  } catch (error) {
    console.error("Error en /faucet/info:", error);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo obtener la información del faucet",
    });
  }
});

export default router;
