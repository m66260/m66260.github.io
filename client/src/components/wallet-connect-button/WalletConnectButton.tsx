import { ConnectButton } from "@rainbow-me/rainbowkit";
import { memo, useState } from "react";

import { Button } from "@mui/material";

import { cutAddressName } from "utils/cutAddressName";

import styles from "./WalletConnectButton.module.scss";
import {
  traderAPIAtom,
  chainIdAtom,
  userAddressAtom,
} from "store/states.store";
import { useAtom } from "jotai";
import { useAccount } from "wagmi";
import { PerpetualDataHandler, TraderInterface } from "@d8x/perpetuals-sdk";

export const WalletConnectButton = memo(() => {
  const [, setChainId] = useAtom(chainIdAtom);
  const [, setTraderAPI] = useAtom(traderAPIAtom);
  const [, setUserAddress] = useAtom(userAddressAtom);

  const [isAPIConnected, setAPIConnected] = useState(false);

  useAccount({
    onConnect({ address, connector, isReconnected }) {
      setUserAddress(address);
      if (connector && (!isAPIConnected || isReconnected)) {
        console.log("Wallet connected", { address, connector, isReconnected });
        connector
          .getChainId()
          .then((id) => {
            setChainId(id);
            connector.getProvider().then((provider) => {
              const api = new TraderInterface(
                PerpetualDataHandler.readSDKConfig(id)
              );
              api.createProxyInstance().then(() => {
                setTraderAPI(api);
                setAPIConnected(true);
                console.log("SDK connected", {
                  address,
                  connector,
                  isReconnected,
                });
              });
            });
          })
          .catch((err) => {
            setAPIConnected(false);
            console.log("Error connecting SDK");
          });
      }
    },
    onDisconnect() {
      console.log("Disconnected");
      setUserAddress(undefined);
      setAPIConnected(false);
      setTraderAPI(null);
    },
  });

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              className: styles.root,
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} variant="primary">
                    Connect
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="warning">
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className={styles.buttonsHolder}>
                  <Button
                    onClick={openChainModal}
                    className={styles.chainButton}
                    variant="primary"
                  >
                    <img
                      src={chain.iconUrl}
                      alt={chain.name}
                      title={chain.name}
                    />
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    variant="primary"
                    className={styles.addressButton}
                  >
                    {cutAddressName(account.address)}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
});
