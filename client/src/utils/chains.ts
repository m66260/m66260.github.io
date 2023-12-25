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
