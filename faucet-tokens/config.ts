import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

const projectId = import.meta.env.VITE_WC_PROJECT_ID;

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected(), metaMask(), walletConnect({ projectId })],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
  },
});
