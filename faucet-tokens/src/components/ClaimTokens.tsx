import {
  useWriteContract,
  useReadContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { faucetTokenAddress, faucetTokenAbi } from "../contracts/faucetToken";

export function ClaimButton() {
  const { address, isConnected } = useAccount();

  const {
    data: hasAddressClaimed,
    isLoading: isCheckingClaim,
    refetch: refetchClaimStatus,
  } = useReadContract({
    address: faucetTokenAddress,
    abi: faucetTokenAbi,
    functionName: "hasAddressClaimed",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // No conectado
  if (!isConnected || !address) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">🦊 Conectá tu wallet primero</p>
      </div>
    );
  }

  // Verificando si ya reclamó
  if (isCheckingClaim) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Verificando estado de reclamo...</p>
      </div>
    );
  }

  // Ya reclamó tokens
  if (hasAddressClaimed) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800">✅ Ya has reclamado tus tokens</p>
      </div>
    );
  }

  const handleClaim = () => {
    writeContract({
      address: faucetTokenAddress,
      abi: faucetTokenAbi,
      functionName: "claimTokens",
    });
  };

  return (
    <div className="space-y-4">
      <button
        disabled={isPending || isConfirming}
        onClick={handleClaim}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
      >
        {isPending || isConfirming ? "Procesando..." : "Reclamar Tokens"}
      </button>

      {hash && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            📝 Transacción enviada: {hash.slice(0, 10)}...{hash.slice(-8)}
          </p>
        </div>
      )}

      {isConfirmed && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">✅ Tokens reclamados con éxito!</p>
          <button
            onClick={() => refetchClaimStatus()}
            className="text-green-600 hover:text-green-800 text-sm underline mt-1"
          >
            Actualizar estado
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">❌ Error: {error.message}</p>
        </div>
      )}
    </div>
  );
}
