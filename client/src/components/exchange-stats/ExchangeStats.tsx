import {
  Box,
  Container,
  TableBody,
  TableContainer,
  TableHead,
  Typography,
} from "@mui/material";

import { PerpFunds } from "components/perp-funds/PerpFunds";
import { PoolFunds } from "components/pool-funds/PoolFunds";
import { ReactComponent as RefreshIcon } from "assets/icons/refreshIcon.svg";
import styles from "./ExchangeStats.module.scss";
import { useCallback, useRef } from "react";
import { useAtom } from "jotai";
import {
  ammAccountAtom,
  perpetualsAtom,
  poolsAtom,
  traderAPIAtom,
} from "store/states.store";
import { IPerpetualManager } from "types";

export const ExchangeStats = () => {
  const [traderAPI] = useAtom(traderAPIAtom);
  const [, setPools] = useAtom(poolsAtom);
  const [, setPerpetuals] = useAtom(perpetualsAtom);
  const [, setAMMAccounts] = useAtom(ammAccountAtom);

  const traderAPIRef = useRef(traderAPI);

  const refreshPositions = useCallback(() => {
    console.log("Reading blockchain...");
    if (traderAPI) {
      const proxy = traderAPI.getReadOnlyProxyInstance() as IPerpetualManager;
      proxy
        .getLiquidityPools(1, 255)
        .then((pools) => {
          setPools(pools);
        })
        .then(() => {
          proxy.getPoolStaticInfo(1, 255).then((res) => {
            const perpIds = res[0].flat();
            proxy.getPerpetuals(perpIds).then((perps) => {
              setPerpetuals(perps);
            });
            Promise.all(
              perpIds.map((perpId) => {
                return proxy.getMarginAccount(
                  perpId,
                  traderAPI.getProxyAddress()
                );
              })
            ).then((accounts) => {
              setAMMAccounts(accounts);
            });
          });
        });
    }
  }, [traderAPI]);

  return (
    <Box>
      <Box className={styles.refreshHolder}>
        <RefreshIcon onClick={refreshPositions} className={styles.actionIcon} />
      </Box>
      <Box>
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
      </Box>
    </Box>
  );
};
