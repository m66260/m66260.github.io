import { Box, Container } from "@mui/material";

// import { PerpFunds } from "components/perp-funds/PerpFunds";
import { PoolFunds } from "components/pool-funds/PoolFunds";
import { ReactComponent as RefreshIcon } from "assets/icons/refreshIcon.svg";
import styles from "./ExchangeStats.module.scss";
import { useCallback } from "react";
import { useAtom } from "jotai";
import {
  ammAccountAtom,
  marginTokensAtom,
  perpetualsAtom,
  poolStaticInfosAtom,
  poolsAtom,
  traderAPIAtom,
} from "store/states.store";
import { AMM } from "components/amm/AMM";
// import { fetchBalance } from "@wagmi/core";
import { Balances } from "components/balances/Balances";
import { Exposure } from "components/exposure/Exposure";
import { PerpStorage } from "types/IPerpetualManager";
export const ExchangeStats = () => {
  const [traderAPI] = useAtom(traderAPIAtom);
  const [, setPools] = useAtom(poolsAtom);
  const [, setPerpetuals] = useAtom(perpetualsAtom);
  const [, setAMMAccounts] = useAtom(ammAccountAtom);
  const [, setMarginTokens] = useAtom(marginTokensAtom);
  const [, setPoolStaticInfos] = useAtom(poolStaticInfosAtom);

  const refreshPools = useCallback(() => {
    console.log("Reading blockchain...");
    if (traderAPI) {
      const proxy = traderAPI.getReadOnlyProxyInstance();
      const proxyAddr = traderAPI.getProxyAddress();
      console.log(`proxyAddr: ${proxyAddr}`);
      proxy
        .getLiquidityPools(1, 255)
        .then((pools) => {
          setPools(pools);
        })
        .then(() => {
          proxy.getPoolStaticInfo(1, 255).then((res) => {
            setPoolStaticInfos(res);
            const perpIds = res[0].flat();
            proxy.getPerpetuals(perpIds).then((perps) => {
              setPerpetuals(perps);
            });
            setMarginTokens([""].concat(res[2]));
            const ammMap = new Map<
              number,
              PerpStorage.MarginAccountStructOutput
            >();
            Promise.all(
              perpIds.map((perpId) => {
                return proxy
                  .getMarginAccount(perpId, proxyAddr)
                  .then((acc) => ammMap.set(perpId, acc));
              })
            ).then(() => {
              setAMMAccounts(ammMap);
            });
          });
        });
    }
  }, [
    traderAPI,
    setPoolStaticInfos,
    setAMMAccounts,
    setPerpetuals,
    setMarginTokens,
    setPools,
  ]);

  return (
    <Box>
      <Box className={styles.refreshHolder}>
        <RefreshIcon onClick={refreshPools} className={styles.actionIcon} />
      </Box>
      <Box>
        <Container className={styles.columnContainer}>
          <PoolFunds />
          {/* <PerpFunds /> */}
          <AMM />
          <Exposure />
          <Balances />
        </Container>
      </Box>
    </Box>
  );
};
