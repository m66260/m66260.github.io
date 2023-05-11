import { memo } from "react";

import { Box } from "@mui/material";

import { Container } from "components/container/Container";
import { Header } from "components/header/Header";
import { Footer } from "components/footer/Footer";
import { ExchangeStats } from "components/exchange-stats/ExchangeStats";

import styles from "./RiskPage.module.scss";
import { Version } from "components/version/Version";

export const RiskPage = memo(() => {
  return (
    <Box>
      <Header />
      <Container className={styles.sidesContainer}>
        <Box className={styles.leftBlock}>
          <ExchangeStats />
        </Box>
        <Box className={styles.rightBlock}>
          <Version />
        </Box>
      </Container>
      <Footer />
    </Box>
  );
});
