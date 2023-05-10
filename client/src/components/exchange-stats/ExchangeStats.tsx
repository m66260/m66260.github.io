// import { useAtom } from 'jotai';

import {
  Box,
  Container,
  Stack,
  TableBody,
  TableContainer,
  TableHead,
  Typography,
} from "@mui/material";

import { PerpFunds } from "components/perp-funds/PerpFunds";
import { PoolFunds } from "components/pool-funds/PoolFunds";
import styles from "./ExchangeStats.module.scss";
import { AlignE } from "types/enums";

export const ExchangeStats = () => {
  return (
    <Container className={styles.sidesContainer}>
      <TableContainer>
        <TableHead className={styles.tableHead}>
          {
            <Typography variant="overline" align="inherit">
              {"Pool Funds"}
            </Typography>
          }
        </TableHead>
        <TableBody>
          <PoolFunds />
        </TableBody>
      </TableContainer>
      <TableContainer>
        <TableHead className={styles.tableHead}>
          {
            <Typography variant="overline" align="inherit">
              {"Perpetual Funds"}
            </Typography>
          }
        </TableHead>
        <TableBody>
          <PerpFunds />
        </TableBody>
      </TableContainer>
      {/* <TableContainer>
        <TableHead className={styles.tableHead}>
          {
            <Typography variant="overline" align="inherit">
              {"Perpetual Funds"}
            </Typography>
          }
        </TableHead>
        <TableBody>
          <AMMState />
        </TableBody>
      </TableContainer> */}
    </Container>
  );
};
