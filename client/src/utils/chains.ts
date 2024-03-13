import { Chain } from "wagmi";

export const x1 = {
  id: 195,
  name: "X1",
  network: "avalanche",
  nativeCurrency: {
    decimals: 18,
    name: "OKX",
    symbol: "OKX",
  },
  rpcUrls: {
    public: { http: ["https://testrpc.x1.tech"] },
    default: { http: ["https://testrpc.x1.tech"] },
  },
  blockExplorers: {
    etherscan: { name: "OKLink", url: "https://www.oklink.com/x1-test" },
    default: { name: "OKLink", url: "https://www.oklink.com/x1-test" },
  },
} as const satisfies Chain;

export const arbitrumSepolia = {
  id: 421_614,
  name: "Arbitrum Sepolia",
  network: "arbitrumSepolia",
  nativeCurrency: {
    name: "Arbitrum Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ["https://sepolia-rollup.arbitrum.io/rpc"],
    },
    default: {
      http: ["https://sepolia-rollup.arbitrum.io/rpc"],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Arbiscan",
      url: "https://sepolia.arbiscan.io",
    },
    default: {
      name: "Arbiscan",
      url: "https://sepolia.arbiscan.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 81930,
    },
  },
  testnet: true,
} as const satisfies Chain;
