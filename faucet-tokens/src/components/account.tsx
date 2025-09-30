import {
  useAccount,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
  useBalance,
  useReadContracts,
} from "wagmi";
import { faucetTokenAddress, faucetTokenAbi } from "../contracts/faucetToken";

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  const { data: contracts } = useReadContracts({
    contracts: [
      {
        address: faucetTokenAddress,
        abi: faucetTokenAbi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
      {
        address: faucetTokenAddress,
        abi: faucetTokenAbi,
        functionName: "getFaucetAmount",
      },
      {
        address: faucetTokenAddress,
        abi: faucetTokenAbi,
        functionName: "hasAddressClaimed",
        args: address ? [address] : undefined,
      },
    ],
  });

  return (
    <div className="mt-10 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar Section */}
        <div className="relative">
          {ensAvatar ? (
            <img
              alt="ENS Avatar"
              src={ensAvatar}
              className="w-20 h-20 rounded-full border-4 border-blue-100 shadow-md object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md">
              <span className="text-2xl text-white font-bold">
                {ensName ? ensName[0].toUpperCase() : "👤"}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Account Info */}
        <div className="text-center space-y-2">
          {ensName && (
            <h3 className="text-lg font-semibold text-gray-800">{ensName}</h3>
          )}
          {address && (
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-xs text-gray-500 mb-1">
                Dirección de la wallet
              </p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </p>
            </div>
          )}
        </div>
        {/* Balance Info */}
        {balance && (
          <div className="bg-gray-50 rounded-lg p-3 border w-full text-center">
            <p className="text-xs text-gray-500 mb-1">Balance ETH</p>
            <p className="text-sm font-mono text-gray-700">
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}

        {/* Faucet Token Info */}
        <div className="w-full space-y-3">
          {contracts?.[0] && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 w-full text-center">
              <p className="text-xs text-blue-600 mb-1">
                Balance de Faucet Tokens
              </p>
              <p className="text-sm font-mono text-blue-800 font-semibold">
                {contracts[0].result
                  ? (Number(contracts[0].result) / 1e18).toFixed(2) + " FT"
                  : "0 FT"}
              </p>
            </div>
          )}

          {contracts?.[1] && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200 w-full text-center">
              <p className="text-xs text-green-600 mb-1">
                Cantidad por Reclamo
              </p>
              <p className="text-sm font-mono text-green-800 font-semibold">
                {contracts[1].result
                  ? (Number(contracts[1].result) / 1e18).toFixed(2) + " FT"
                  : "0 FT"}
              </p>
            </div>
          )}

          {contracts?.[2] !== undefined && (
            <div
              className={`rounded-lg p-3 border w-full text-center ${
                contracts[2].result
                  ? "bg-orange-50 border-orange-200"
                  : "bg-purple-50 border-purple-200"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  contracts[2].result ? "text-orange-600" : "text-purple-600"
                }`}
              >
                Estado de Reclamo
              </p>
              <p
                className={`text-sm font-semibold ${
                  contracts[2].result ? "text-orange-800" : "text-purple-800"
                }`}
              >
                {contracts[2].result
                  ? "✅ Ya reclamado"
                  : "❌ Disponible para reclamar"}
              </p>
            </div>
          )}
        </div>

        {/* Contract Info */}
        <div className="bg-gray-50 rounded-lg p-3 border w-full">
          <p className="text-xs text-gray-500 mb-2 text-center">
            Contrato Faucet
          </p>
          <p className="text-xs font-mono text-gray-700 text-center break-all">
            {faucetTokenAddress}
          </p>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={() => disconnect()}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          Desconectar
        </button>
      </div>
    </div>
  );
}
