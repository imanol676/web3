import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import {
  claimTokens,
  getFaucetStatus,
  requestSignInMessage,
  signIn,
  isAuthenticated,
  signOut,
  formatBalance,
} from "../services/api";

export function ClaimButton() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [balance, setBalance] = useState("0");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Verificar autenticación al montar y cuando cambia la dirección
  useEffect(() => {
    setAuthenticated(isAuthenticated());

    if (address && isAuthenticated()) {
      loadFaucetStatus();
    } else {
      setHasClaimed(false);
      setBalance("0");
    }
  }, [address]);

  const loadFaucetStatus = async () => {
    if (!address) return;

    setIsLoadingStatus(true);
    setError(null);

    try {
      const status = await getFaucetStatus(address);
      setHasClaimed(status.hasClaimed);
      setBalance(status.balance);
    } catch (err: any) {
      console.error("Error cargando estado:", err);

      if (
        err.message?.includes("Token") ||
        err.message?.includes("autenticación")
      ) {
        signOut();
        setAuthenticated(false);
      }
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!address) return;

    setIsAuthenticating(true);
    setError(null);

    try {
      // 1. Solicitar mensaje SIWE al backend
      const { message } = await requestSignInMessage(address);

      // 2. Firmar el mensaje con la wallet
      const signature = await signMessageAsync({ message });

      // 3. Enviar firma al backend y obtener JWT
      const response = await signIn(message, signature);

      setAuthenticated(true);
      setSuccess(
        `✅ Autenticado como ${response.address.slice(0, 6)}...${response.address.slice(-4)}`
      );

      // 4. Cargar estado del faucet
      await loadFaucetStatus();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error en autenticación:", err);
      setError(err.message || "Error al autenticar");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    setError(null);
    setTxHash(null);

    try {
      const response = await claimTokens();

      setTxHash(response.txHash);
      setSuccess("✅ Tokens reclamados con éxito!");

      // Actualizar estado después de reclamar
      setTimeout(() => {
        loadFaucetStatus();
      }, 2000);
    } catch (err: any) {
      console.error("Error reclamando tokens:", err);
      setError(err.message || "Error al reclamar tokens");

      // Si hay error de autenticación, limpiar sesión
      if (
        err.message?.includes("Token") ||
        err.message?.includes("autenticación")
      ) {
        signOut();
        setAuthenticated(false);
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    setAuthenticated(false);
    setHasClaimed(false);
    setBalance("0");
    setSuccess("Sesión cerrada");
    setTimeout(() => setSuccess(null), 2000);
  };

  // No conectado
  if (!isConnected || !address) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800"> Conectá tu wallet primero</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 mb-2">
            🔐 Para reclamar tokens, primero debes autenticarte
          </p>
          <p className="text-blue-600 text-sm">
            Firmarás un mensaje con tu wallet (sin costo de gas)
          </p>
        </div>

        <button
          disabled={isAuthenticating}
          onClick={handleAuthenticate}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {isAuthenticating ? "Autenticando..." : "🔑 Autenticar con Ethereum"}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}
      </div>
    );
  }

  // Autenticado - Verificando estado
  if (isLoadingStatus) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Verificando estado de reclamo...</p>
      </div>
    );
  }

  // Ya reclamó tokens
  if (hasClaimed) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✅ Ya has reclamado tus tokens
          </p>
          {balance !== "0" && (
            <p className="text-green-700 text-sm mt-2">
              Balance: {formatBalance(balance)} tokens
            </p>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // Puede reclamar
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          🔓 Autenticado: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Cerrar sesión
        </button>
      </div>

      <button
        disabled={isClaiming}
        onClick={handleClaim}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
      >
        {isClaiming ? "Reclamando..." : "🎁 Reclamar Tokens"}
      </button>

      {txHash && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm font-semibold mb-1">
            📝 Transacción confirmada:
          </p>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs break-all underline"
          >
            {txHash}
          </a>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">❌ {error}</p>
        </div>
      )}
    </div>
  );
}
