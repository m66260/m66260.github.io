import { memo } from "react";

import { Box, Toolbar, Typography } from "@mui/material";

import { Container } from "../container/Container";
import { InteractiveLogo } from "../interactive-logo/InteractiveLogo";
import { WalletConnectButton } from "../wallet-connect-button/WalletConnectButton";
import styles from "./Header.module.scss";
import { PageAppBar } from "./Header.styles";

export const Header = memo(() => {
  return (
    <Container className={styles.root}>
      <Box sx={{ display: "flex" }}>
        <PageAppBar position="static">
          <Toolbar className={styles.toolbar}>
            <Box className={styles.leftSide}>
              <Typography variant="h6" component="div">
                <a href="/" className={styles.logoLink}>
                  <InteractiveLogo />
                </a>
              </Typography>
            </Box>
            <Box className={styles.leftSide}>
              <Typography variant="h5" component="div">
                {"Risk Monitoring"}
              </Typography>
            </Box>
            <Typography
              variant="h6"
              component="div"
              className={styles.walletConnect}
            >
              <WalletConnectButton />
            </Typography>
          </Toolbar>
        </PageAppBar>
      </Box>
    </Container>
  );
});
