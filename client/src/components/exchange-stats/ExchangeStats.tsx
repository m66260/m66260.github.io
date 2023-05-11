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
import { useCallback, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import {
  ammAccountAtom,
  marginTokensAtom,
  perpetualsAtom,
  poolsAtom,
  tokenBalancesAtom,
  traderAPIAtom,
  tokenSymbolsAtom,
} from "store/states.store";
import { IPerpetualManager } from "types";
import { AMM } from "components/amm/AMM";
import { fetchBalance } from "@wagmi/core";
import { WALLETS } from "assets/wallets/wallets";
import { Balances } from "components/balances/Balances";

export const ExchangeStats = () => {
  const [traderAPI] = useAtom(traderAPIAtom);
  const [, setPools] = useAtom(poolsAtom);
  const [, setPerpetuals] = useAtom(perpetualsAtom);
  const [, setAMMAccounts] = useAtom(ammAccountAtom);
  const [marginTokens, setMarginTokens] = useAtom(marginTokensAtom);
  const [, setTokenBalances] = useAtom(tokenBalancesAtom);
  const [, setTokenSymbols] = useAtom(tokenSymbolsAtom);

  const refreshPools = useCallback(() => {
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
            setMarginTokens([""].concat(res[2]));
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
  }, [traderAPI, setAMMAccounts, setPerpetuals, setPools]);

  const tokenBalances = useMemo(() => {
    if (marginTokens) {
      return Promise.all(
        marginTokens.map((token) => {
          return Promise.all(
            WALLETS.map((s) => {
              return fetchBalance({
                address: s.address as `0x${string}`,
                token: token.length > 0 ? (token as `0x${string}`) : undefined,
              }).then((balance) => {
                return balance;
              });
            })
          );
        })
      );
    }
  }, [marginTokens]);

  useEffect(() => {
    if (tokenBalances) {
      tokenBalances.then((balances) => {
        // console.log(balances);
        setTokenBalances(balances.map((t) => t.map((ta) => ta.formatted)));
        setTokenSymbols(balances.map((t) => t[0].symbol));
      });
    }
  }, [tokenBalances, setTokenBalances, setTokenSymbols]);

  return (
    <Box>
      <Box className={styles.refreshHolder}>
        <RefreshIcon onClick={refreshPools} className={styles.actionIcon} />
      </Box>
      <Box>
        <Container className={styles.columnContainer}>
          <TableContainer>
            <TableHead className={styles.tableHead}>
              {
                <Typography variant="overline" align="inherit">
                  {"Liquidity Pools"}
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
                  {"Perpetuals"}
                </Typography>
              }
            </TableHead>
            <TableBody>
              <PerpFunds />
            </TableBody>
          </TableContainer>
          <TableContainer>
            <TableHead className={styles.tableHead}>
              {
                <Typography variant="overline" align="inherit">
                  {"AMM"}
                </Typography>
              }
            </TableHead>
            <TableBody>
              <AMM />
            </TableBody>
          </TableContainer>
          <TableContainer>
            <TableHead className={styles.tableHead}>
              {
                <Typography variant="overline" align="inherit">
                  {"Services"}
                </Typography>
              }
            </TableHead>
            <TableBody>
              <Balances />
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
