import {
  ABK64x64ToFloat,
  COLLATERAL_CURRENCY_BASE,
  COLLATERAL_CURRENCY_QUOTE,
} from "@d8x/perpetuals-sdk";
import { TableCell, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { traderAPIAtom } from "store/states.store";

import { IPerpetualManager, PerpStorage } from "types/IPerpetualManager";
import { formatNumber } from "utils/formatNumber";

interface ExposurePropI {
  perpetual: PerpStorage.PerpetualDataStructOutput;
  amm: PerpStorage.MarginAccountStructOutput;
  pxS2S3: [number, number];
}

export const ExposureRow = ({ perpetual, amm, pxS2S3 }: ExposurePropI) => {
  const [traderAPI] = useAtom(traderAPIAtom);
  const [numAccounts, setNumAccounts] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (traderAPI) {
      setNumAccounts(undefined);
      const proxy = traderAPI.getReadOnlyProxyInstance() as IPerpetualManager;
      proxy
        .countActivePerpAccounts(perpetual.id)
        .then((num) => setNumAccounts(Number(num)));
    }
  }, [traderAPI, perpetual.id, setNumAccounts]);

  const avgPosition = useMemo(() => {
    if (numAccounts && numAccounts > 0) {
      return (
        ABK64x64ToFloat(
          perpetual.fOpenInterest.mul(2).sub(amm.fPositionBC.abs())
        ) / numAccounts
      );
    }
  }, [numAccounts, amm.fPositionBC, perpetual.fOpenInterest]);

  const staleOracleLoss = useMemo(() => {
    const S20 = ABK64x64ToFloat(perpetual.fSettlementS2PriceData);
    const S30 = ABK64x64ToFloat(perpetual.fSettlementS3PriceData);
    const pos = ABK64x64ToFloat(amm.fPositionBC);
    const cash =
      ABK64x64ToFloat(amm.fCashCC) -
      ABK64x64ToFloat(
        perpetual.fUnitAccumulatedFunding.sub(amm.fUnitAccumulatedFundingStart)
      ) *
        pos;
    const bal0 =
      cash + (pos * S20 - ABK64x64ToFloat(amm.fLockedInValueQC)) / S30;
    const bal1 =
      cash +
      (pos * pxS2S3[0] - ABK64x64ToFloat(amm.fLockedInValueQC)) / pxS2S3[1];
    return bal1 - bal0;
  }, [pxS2S3, perpetual, amm]);

  const pctPnL = useCallback(
    (pct: number) => {
      const pos = ABK64x64ToFloat(amm.fPositionBC);
      const cash =
        ABK64x64ToFloat(amm.fCashCC) -
        ABK64x64ToFloat(
          perpetual.fUnitAccumulatedFunding.sub(
            amm.fUnitAccumulatedFundingStart
          )
        ) *
          pos;
      const bal0 =
        cash +
        (pos * pxS2S3[0] - ABK64x64ToFloat(amm.fLockedInValueQC)) / pxS2S3[1];
      const S2 = pxS2S3[0];
      const S3 = pxS2S3[1];
      const L1 = ABK64x64ToFloat(amm.fLockedInValueQC);
      let bal1: number[];
      if (perpetual.eCollateralCurrency === COLLATERAL_CURRENCY_BASE) {
        bal1 = [pct, -pct].map(
          (x) => cash + (pos * S2 * (1 + x) - L1) / (S2 * (1 + x))
        );
      } else if (perpetual.eCollateralCurrency === COLLATERAL_CURRENCY_QUOTE) {
        bal1 = [pct, -pct].map((x) => cash + (pos * S2 * (1 + x) - L1));
      } else {
        bal1 = [
          [pct, pct],
          [pct, -pct],
          [-pct, pct],
          [-pct, -pct],
        ].map((x) => cash + (pos * S2 * (1 + x[0]) - L1) / (S3 * (1 + x[1])));
      }
      return [Math.max(...bal1) - bal0, Math.min(...bal1) - bal0];
    },
    [pxS2S3, perpetual, amm]
  );

  const onePctPnL = pctPnL(0.01);

  const fivePctPnL = pctPnL(0.05);

  const tenPctPnL = pctPnL(0.1);

  return (
    (numAccounts && numAccounts > 0 && (
      <TableRow>
        <TableCell align="right">
          <Typography variant="cellSmall">{perpetual.id}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {numAccounts ? numAccounts : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {avgPosition ? `${formatNumber(avgPosition)}` : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {staleOracleLoss ? `${formatNumber(staleOracleLoss)}` : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {`${formatNumber(onePctPnL[0])} / ${formatNumber(onePctPnL[1])}`}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {`${formatNumber(fivePctPnL[0])} / ${formatNumber(fivePctPnL[1])}`}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {`${formatNumber(tenPctPnL[0])} / ${formatNumber(tenPctPnL[1])}`}
          </Typography>
        </TableCell>
      </TableRow>
    )) ||
    null
  );
};
