import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient } from "wagmi";
import { polygonZkEvm, polygonZkEvmTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

// import polygonMainIcon from "assets/networks/polygonMain.svg";
// import polygonTestIcon from "assets/networks/polygonTest.svg";
import zkMainIcon from "assets/networks/zkEvmMain.svg";
import zkTestIcon from "assets/networks/zkEvmTest.svg";
import { arbitrumSepolia, x1 } from "utils/chains";

const defaultChains: Chain[] = [
  // { ...polygon, iconUrl: polygonMainIcon, iconBackground: 'transparent' },
  // { ...polygonMumbai, iconUrl: polygonTestIcon, iconBackground: 'transparent' },
  { ...polygonZkEvm, iconUrl: zkMainIcon, iconBackground: "transparent" },
  {
    ...polygonZkEvmTestnet,
    iconUrl: zkTestIcon,
    iconBackground: "transparent",
  },
  x1,
  arbitrumSepolia,
];

const { chains, provider } = configureChains(defaultChains, [publicProvider()]);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ chains }),
      walletConnectWallet({ chains }),
      coinbaseWallet({ chains, appName: "D8X App" }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export { chains, wagmiClient };
