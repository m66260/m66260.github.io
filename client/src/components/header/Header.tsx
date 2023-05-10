import { memo } from "react";

import { Box, Toolbar, Typography } from "@mui/material";

import { Container } from "../container/Container";
import { InteractiveLogo } from "../interactive-logo/InteractiveLogo";
import { WalletConnectButton } from "../wallet-connect-button/WalletConnectButton";
import styles from "./Header.module.scss";
import { PageAppBar } from "./Header.styles";
// import { useAtom } from "jotai";
// import { traderAPIAtom } from "store/states.store";
// import { Link } from "react-router-dom";

export const Header = memo(() => {
  // const [traderAPI] = useAtom(traderAPIAtom);

  // const proxyURL = useMemo(() => {
  //   return traderAPI
  //     ? `https://mumbai.polygonscan.com/address/${traderAPI.getProxyAddress()}`
  //     : "#";
  // }, [traderAPI]);

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
            <Box className={styles.header}>
              <Typography variant="h4" component="div">
                {"Risk Monitoring"}
              </Typography>
              {/* <Link to={{ pathname: proxyURL }} target="_blank" color="inherit">
                <Typography variant="overline" component="div">
                  {"Proxy"}
                </Typography>
              </Link> */}
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
