import { faucetTokenAddress } from "../contracts/faucetToken";

export function FaucetUsers() {
  // Componente informativo sobre el faucet (sin llamadas al contrato)
  // ya que las funciones esperadas no están disponibles en el contrato real

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🎯 Información del Faucet
        </h3>
      </div>

      <div className="space-y-4">
        {/* Información del contrato */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-medium mb-2">
            📋 Detalles del Contrato
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Dirección:</span>
              <p className="font-mono text-blue-800 break-all mt-1">
                {faucetTokenAddress}
              </p>
              <a
                href={`https://sepolia.etherscan.io/address/${faucetTokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-xs"
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
            <li>Asegúrate de estar en la red Sepolia</li>
            <li>Haz clic en "Reclamar Tokens" en tu perfil</li>
            <li>Confirma la transacción en tu wallet</li>
            <li>¡Espera la confirmación y disfruta tus tokens!</li>
          </ol>
        </div>

        {/* Funcionalidades disponibles */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-indigo-800 font-medium mb-2">
            ⚡ Funcionalidades Disponibles
          </h4>
          <ul className="text-indigo-700 text-sm space-y-1 list-disc list-inside">
            <li>Reclamar tokens del faucet (una vez por wallet)</li>
            <li>Verificar si ya has reclamado tokens</li>
            <li>Ver tu balance de tokens del faucet</li>
            <li>Consultar el balance de ETH de tu wallet</li>
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
