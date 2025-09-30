import { Abi } from "viem";

export const faucetTokenAddress = "0x3e2117c19a921507ead57494bbf29032f33c7412"; // Dirección del contrato en Sepolia

export const faucetTokenAbi: Abi = [
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
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
];
