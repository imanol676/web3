import * as React from "react";
import { Connector, useConnect } from "wagmi";

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return (
    <div className="mt-10 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Conecta tu Wallet
      </h3>
      <div className="space-y-3">
        {connectors.map((connector) => (
          <WalletOption
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector })}
          />
        ))}
      </div>
    </div>
  );
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <button
      className={`w-full flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
        ready
          ? "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 cursor-pointer"
          : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
      }`}
      disabled={!ready}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">
          {connector.name === "MetaMask"
            ? "🦊"
            : connector.name === "WalletConnect"
              ? "🔗"
              : connector.name === "Coinbase Wallet"
                ? "🟦"
                : "💼"}
        </div>
        <div className="flex flex-col items-start">
          <span
            className={`font-medium ${ready ? "text-gray-800" : "text-gray-500"}`}
          >
            {connector.name}
          </span>
          {!ready && (
            <span className="text-sm text-red-500">No disponible</span>
          )}
        </div>
      </div>
      {ready && (
        <div className="text-blue-500">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
