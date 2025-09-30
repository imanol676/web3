import { useAccount, WagmiProvider } from "wagmi";
import { config } from "../config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Account } from "./components/account";
import { WalletOptions } from "./components/wallet-options";
import { ClaimButton } from "./components/ClaimTokens";
import { FaucetUsers } from "./components/listUsers";

const queryClient = new QueryClient();

function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectWallet />
        <div className="mt-10 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Reclama tus Tokens Gratis
          </h3>
          <ClaimButton />
        </div>
        <div className="mt-10 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <FaucetUsers />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
