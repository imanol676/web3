// Servicio para comunicarse con el backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Storage key para el token JWT
const TOKEN_KEY = "faucet_jwt_token";

/**
 * Obtiene el token JWT del localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Guarda el token JWT en el localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Elimina el token JWT del localStorage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Helper para hacer peticiones al backend con manejo de errores
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Agregar token si existe
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Error en la petición");
    }

    return data;
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error);
    throw error;
  }
}

// ==================== AUTENTICACIÓN ====================

/**
 * Solicita un mensaje SIWE para firmar
 */
export async function requestSignInMessage(address: string): Promise<{
  message: string;
  address: string;
}> {
  return fetchAPI("/auth/message", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

/**
 * Verifica la firma y obtiene el JWT
 */
export async function signIn(
  message: string,
  signature: string
): Promise<{
  token: string;
  address: string;
  message: string;
}> {
  const response = await fetchAPI("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ message, signature }),
  });

  // Guardar el token
  if (response.token) {
    setToken(response.token);
  }

  return response;
}

/**
 * Verifica si el token actual es válido
 */
export async function verifyToken(): Promise<{
  valid: boolean;
  address?: string;
}> {
  try {
    return await fetchAPI("/auth/verify");
  } catch (error) {
    return { valid: false };
  }
}

/**
 * Cierra la sesión (elimina el token)
 */
export function signOut(): void {
  removeToken();
}

// ==================== FAUCET ====================

/**
 * Reclama tokens del faucet
 */
export async function claimTokens(): Promise<{
  success: boolean;
  txHash: string;
  message: string;
  explorer: string;
}> {
  return fetchAPI("/faucet/claim", {
    method: "POST",
  });
}

/**
 * Obtiene el estado del faucet para una dirección
 */
export async function getFaucetStatus(address: string): Promise<{
  address: string;
  hasClaimed: boolean;
  balance: string;
  totalUsers: number;
  users: string[];
}> {
  return fetchAPI(`/faucet/status/${address}`);
}

/**
 * Obtiene información general del faucet (no requiere autenticación)
 */
export async function getFaucetInfo(): Promise<{
  contractAddress: string;
  network: string;
  chainId: number;
  totalUsers: number;
  message: string;
}> {
  return fetchAPI("/faucet/info");
}

// ==================== UTILIDADES ====================

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  return token !== null;
}

/**
 * Formatea un balance de wei a ETH con decimales
 */
export function formatBalance(balance: string): string {
  try {
    const balanceBigInt = BigInt(balance);
    const eth = Number(balanceBigInt) / 1e18;
    return eth.toFixed(4);
  } catch (error) {
    return "0.0000";
  }
}
