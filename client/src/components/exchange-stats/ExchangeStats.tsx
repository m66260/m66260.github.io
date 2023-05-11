import {
  Box,
  Container,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Table as MuiTable,
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
  allServicesAtom,
} from "store/states.store";
import { IPerpetualManager } from "types";
import { AMM } from "components/amm/AMM";
import { fetchBalance } from "@wagmi/core";
import { Balances } from "components/balances/Balances";
import { AlignE } from "types/enums";
import { D8X_SDK_VERSION } from "@d8x/perpetuals-sdk";

export const ExchangeStats = () => {
  const [traderAPI] = useAtom(traderAPIAtom);
  const [, setPools] = useAtom(poolsAtom);
  const [, setPerpetuals] = useAtom(perpetualsAtom);
  const [, setAMMAccounts] = useAtom(ammAccountAtom);
  const [marginTokens, setMarginTokens] = useAtom(marginTokensAtom);
  const [, setTokenBalances] = useAtom(tokenBalancesAtom);
  const [, setTokenSymbols] = useAtom(tokenSymbolsAtom);
  const [allServices] = useAtom(allServicesAtom);

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
  }, [traderAPI, setAMMAccounts, setPerpetuals, setMarginTokens, setPools]);

  const tokenBalances = useMemo(() => {
    if (marginTokens && allServices) {
      return Promise.all(
        marginTokens.map((token) => {
          return Promise.all(
            allServices.map((s) => {
              return fetchBalance({
                address: s.address as `0x${string}`,
                token: token.length > 0 ? (token as `0x${string}`) : undefined,
              }).then((balance) => {
                console.log(balance);
                return balance;
              });
            })
          );
        })
      );
    }
  }, [marginTokens, allServices]);

  useEffect(() => {
    if (tokenBalances) {
      tokenBalances.then((balances) => {
        // console.log(balances);
        setTokenBalances(balances.map((t) => t.map((ta) => ta.formatted)));
        setTokenSymbols(balances.map((t) => t[0].symbol));
      });
    }
  }, [tokenBalances, setTokenBalances, setTokenSymbols]);

  function Version() {
    return (
      <TableContainer>
        <TableHead className={styles.tableHead}>
          {
            <Typography variant="overline" align="inherit">
              Version
            </Typography>
          }
        </TableHead>
        <TableBody>
          <Box className={styles.root}>
            <TableContainer className={styles.tableBody}>
              <MuiTable>
                <TableHead className={styles.tableHead}>
                  <TableRow>
                    {[
                      { label: "Perpetual Manager", align: AlignE.Left },
                      { label: "Node SDK", align: AlignE.Left },
                    ].map((header) => (
                      <TableCell
                        key={header.label.toString()}
                        align={header.align}
                      >
                        <Typography variant="bodySmall">
                          {header.label}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody className={styles.tableBody}>
                  <TableRow>
                    <TableCell align="right">
                      <Typography variant="cellSmall">
                        {traderAPI ? traderAPI.getProxyAddress() : ""}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="cellSmall">
                        {D8X_SDK_VERSION}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </MuiTable>
            </TableContainer>
          </Box>
        </TableBody>
      </TableContainer>
    );
  }

  return (
    <Box>
      <Box className={styles.refreshHolder}>
        <RefreshIcon onClick={refreshPools} className={styles.actionIcon} />
        {/* <Typography variant="h6" align="center">
          {" "}
          {traderAPI ? "Proxy: " : ""}
          <Typography variant="subtitle1" align="center">
            {traderAPI ? `${traderAPI.getProxyAddress()}` : ""}
          </Typography>
        </Typography> */}
      </Box>
      <Box>
        <Container className={styles.columnContainer}>
          <Version />
          <TableContainer>
            <TableHead className={styles.tableHead}>
              {
                <Typography variant="overline" align="inherit">
                  Liquidity Pools
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
