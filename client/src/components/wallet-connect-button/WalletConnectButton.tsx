import { ConnectButton } from "@rainbow-me/rainbowkit";
import { memo } from "react";

import { Button } from "@mui/material";

import { cutAddressName } from "utils/cutAddressName";

import styles from "./WalletConnectButton.module.scss";

export const WalletConnectButton = memo(() => {
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
