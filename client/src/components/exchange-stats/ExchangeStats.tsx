import {
  Container,
  TableBody,
  TableContainer,
  TableHead,
  Typography,
} from "@mui/material";

import { PerpFunds } from "components/perp-funds/PerpFunds";
import { PoolFunds } from "components/pool-funds/PoolFunds";
import styles from "./ExchangeStats.module.scss";

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
