import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// ABI del contrato Faucet
const FAUCET_ABI = [
  {
    type: "function",
    name: "claimTokens",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "hasAddressClaimed",
    stateMutability: "view",
    inputs: [{ name: "addr", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "users",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "getUsersLength",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensClaimed",
    inputs: [
      { name: "claimer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
];

// Configuración del provider y wallet
let provider;
let wallet;
let contract;

/**
 * Inicializa la conexión con la blockchain
 */
function initializeProvider() {
  if (!provider) {
    if (!process.env.RPC_URL) {
      throw new Error("RPC_URL no está configurada en .env");
    }

    provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    console.log("✅ Provider inicializado");
  }
  return provider;
}

/**
 * Inicializa el wallet del backend
 */
function initializeWallet() {
  if (!wallet) {
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY no está configurada en .env");
    }

    const prov = initializeProvider();
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, prov);
    console.log(`✅ Wallet inicializada: ${wallet.address}`);
  }
  return wallet;
}

/**
 * Obtiene la instancia del contrato
 */
function getContract() {
  if (!contract) {
    if (!process.env.CONTRACT_ADDRESS) {
      throw new Error("CONTRACT_ADDRESS no está configurada en .env");
    }

    const w = initializeWallet();
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, FAUCET_ABI, w);
    console.log(`✅ Contrato inicializado en: ${process.env.CONTRACT_ADDRESS}`);
  }
  return contract;
}

/**
 * Ejecuta claimTokens en el smart contract
 * @param {string} userAddress - Dirección del usuario que reclama
 * @returns {Promise<{success: boolean, txHash?: string, error?: string}>}
 */
export async function claimTokensFromContract(userAddress) {
  try {
    const contractInstance = getContract();

    console.log(`Ejecutando claimTokens para ${userAddress}...`);

    // Ejecutar la transacción
    const tx = await contractInstance.claimTokens({
      gasLimit: 200000, // Límite de gas estimado
    });

    console.log(`Transacción enviada: ${tx.hash}`);

    // Esperar confirmación
    const receipt = await tx.wait();

    console.log(`Transacción confirmada en bloque ${receipt.blockNumber}`);

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("Error en claimTokensFromContract:", error);

    // Parsear errores comunes
    let errorMessage = error.message;

    if (error.message.includes("already claimed")) {
      errorMessage = "Ya has reclamado tus tokens";
    } else if (error.message.includes("insufficient funds")) {
      errorMessage = "El backend no tiene suficiente ETH para gas";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Verifica si una dirección ya reclamó tokens
 * @param {string} address - Dirección a verificar
 * @returns {Promise<boolean>}
 */
export async function hasAddressClaimedTokens(address) {
  try {
    const contractInstance = getContract();
    const hasClaimed = await contractInstance.hasAddressClaimed(address);
    return hasClaimed;
  } catch (error) {
    console.error("Error en hasAddressClaimedTokens:", error);
    throw new Error("No se pudo verificar el estado de reclamo");
  }
}

/**
 * Obtiene el balance de tokens de una dirección
 * @param {string} address - Dirección a consultar
 * @returns {Promise<bigint>}
 */
export async function getBalanceOf(address) {
  try {
    const contractInstance = getContract();
    const balance = await contractInstance.balanceOf(address);
    return balance;
  } catch (error) {
    console.error("Error en getBalanceOf:", error);
    throw new Error("No se pudo obtener el balance");
  }
}

/**
 * Obtiene la lista de todos los usuarios que han reclamado
 * @returns {Promise<string[]>}
 */
export async function getAllUsers() {
  try {
    const contractInstance = getContract();

    // Intentar obtener la longitud del array de usuarios
    let usersLength;
    try {
      usersLength = await contractInstance.getUsersLength();
    } catch (error) {
      // Si no existe la función getUsersLength, asumir que no hay usuarios o usar método alternativo
      console.warn("getUsersLength no disponible, retornando array vacío");
      return [];
    }

    const users = [];
    const length = Number(usersLength);

    // Obtener cada usuario del array
    for (let i = 0; i < length; i++) {
      try {
        const user = await contractInstance.users(i);
        users.push(user);
      } catch (error) {
        console.error(`Error obteniendo usuario en índice ${i}:`, error);
      }
    }

    return users;
  } catch (error) {
    console.error("Error en getAllUsers:", error);
    return []; // Retornar array vacío en caso de error
  }
}

/**
 * Obtiene información general del contrato
 * @returns {Promise<object>}
 */
export async function getContractInfo() {
  try {
    const contractInstance = getContract();
    const w = initializeWallet();

    const [backendBalance, users] = await Promise.all([
      provider.getBalance(w.address),
      getAllUsers(),
    ]);

    return {
      contractAddress: process.env.CONTRACT_ADDRESS,
      backendAddress: w.address,
      backendBalance: ethers.formatEther(backendBalance),
      totalUsers: users.length,
      network: "Sepolia",
      chainId: 11155111,
    };
  } catch (error) {
    console.error("Error en getContractInfo:", error);
    throw new Error("No se pudo obtener información del contrato");
  }
}

// Inicializar al cargar el módulo
try {
  initializeProvider();
  initializeWallet();
  getContract();
} catch (error) {
  console.error("⚠️ Error inicializando conexión blockchain:", error.message);
  console.error("Por favor verifica tu archivo .env");
}
