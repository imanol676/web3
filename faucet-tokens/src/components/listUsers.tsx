import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getFaucetInfo, isAuthenticated } from "../services/api";
import { faucetTokenAddress } from "../contracts/faucetToken";

export function FaucetUsers() {
  const { isConnected } = useAccount();
  const [faucetInfo, setFaucetInfo] = useState<{
    totalUsers: number;
    network: string;
    chainId: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFaucetInfo();
  }, []);

  const loadFaucetInfo = async () => {
    setIsLoading(true);
    try {
      const info = await getFaucetInfo();
      setFaucetInfo(info);
    } catch (error) {
      console.error("Error cargando info del faucet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticated = isAuthenticated();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🎯 Información del Faucet
        </h3>
        {isLoading && (
          <span className="text-xs text-gray-500">Cargando...</span>
        )}
      </div>

      <div className="space-y-4">
        {/* Estado de conexión y autenticación */}
        <div
          className={`${
            isConnected && authenticated
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          } border rounded-lg p-4`}
        >
          <h4
            className={`${
              isConnected && authenticated
                ? "text-green-800"
                : "text-yellow-800"
            } font-medium mb-2`}
          >
            {isConnected && authenticated
              ? "✅ Conectado y Autenticado"
              : "⚠️ Estado de Conexión"}
          </h4>
          <div className="space-y-1 text-sm">
            <p className={isConnected ? "text-green-700" : "text-yellow-700"}>
              Wallet: {isConnected ? "Conectada" : "No conectada"}
            </p>
            <p className={authenticated ? "text-green-700" : "text-yellow-700"}>
              Autenticación: {authenticated ? "Activa" : "No autenticado"}
            </p>
          </div>
        </div>

        {/* Estadísticas del Faucet */}
        {faucetInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-800 font-medium mb-2">� Estadísticas</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Red:</span>
                <span className="text-blue-800">{faucetInfo.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Chain ID:</span>
                <span className="text-blue-800">{faucetInfo.chainId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">
                  Usuarios totales:
                </span>
                <span className="text-blue-800 font-semibold">
                  {faucetInfo.totalUsers}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Información del contrato */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-indigo-800 font-medium mb-2">
            �📋 Detalles del Contrato
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-indigo-600 font-medium">Dirección:</span>
              <p className="font-mono text-indigo-800 break-all mt-1 text-xs">
                {faucetTokenAddress}
              </p>
              <a
                href={`https://sepolia.etherscan.io/address/${faucetTokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline text-xs"
              >
                Ver en Etherscan →
              </a>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-purple-800 font-medium mb-2">
            📖 Cómo usar el faucet
          </h4>
          <ol className="text-purple-700 text-sm space-y-1 list-decimal list-inside">
            <li>Conecta tu wallet (MetaMask recomendado)</li>
            <li>Autentícate firmando un mensaje (sin costo)</li>
            <li>Haz clic en "Reclamar Tokens"</li>
            <li>¡El backend procesará tu reclamo!</li>
            <li>Espera la confirmación y disfruta tus tokens</li>
          </ol>
        </div>

        {/* Funcionalidades disponibles */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h4 className="text-teal-800 font-medium mb-2">⚡ Funcionalidades</h4>
          <ul className="text-teal-700 text-sm space-y-1 list-disc list-inside">
            <li>Autenticación Web3 con Sign-In with Ethereum (SIWE)</li>
            <li>Reclamar tokens sin pagar gas (backend paga)</li>
            <li>Verificar estado de reclamo y balance</li>
            <li>Protección con JWT tokens</li>
            <li>Una reclamación por wallet</li>
          </ul>
        </div>

        {/* Enlaces útiles */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-gray-800 font-medium mb-2">🔗 Enlaces Útiles</h4>
          <div className="space-y-2 text-sm">
            <a
              href="https://sepoliafaucet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              🚰 Faucet de ETH para Sepolia →
            </a>
            <a
              href="https://sepolia.etherscan.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              🔍 Explorador de Sepolia →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
