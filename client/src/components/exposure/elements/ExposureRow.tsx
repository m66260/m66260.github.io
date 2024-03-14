import {
  ABK64x64ToFloat,
  COLLATERAL_CURRENCY_BASE,
  COLLATERAL_CURRENCY_QUOTE,
} from "@d8x/perpetuals-sdk";
import { TableCell, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { traderAPIAtom } from "store/states.store";

import { PerpStorage } from "types/IPerpetualManager";
import { formatNumber } from "utils/formatNumber";
// import { getDepth as getBinanceDepth } from "cex-api/binance";
// import { getDepth as getKuCoinDepth } from "cex-api/kucoin";
// import { BinanceDepthI, KuCoinDepthI, OrderBookI } from "types/types";
import { calculateAMMTargetSize } from "utils/perpMath";

interface ExposurePropI {
  perpetual: PerpStorage.PerpetualDataStructOutput;
  amm: PerpStorage.MarginAccountStructOutput;
  pxS2S3: [number, number];
}

export const ExposureRow = ({ perpetual, amm, pxS2S3 }: ExposurePropI) => {
  const [traderAPI] = useAtom(traderAPIAtom);

  const [numAccounts, setNumAccounts] = useState<number | undefined>(undefined);
  // const [binanceOB, setBinanceOB] = useState<BinanceDepthI | undefined>(
  //   undefined
  // );
  // const [kuCoinOB, setKuCoinOB] = useState<KuCoinDepthI | undefined>(undefined);
  const [maxLong, setMaxLong] = useState<number | undefined>(undefined);
  const [maxShort, setMaxShort] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (traderAPI) {
      setNumAccounts(undefined);
      const proxy = traderAPI.getReadOnlyProxyInstance();
      proxy
        .countActivePerpAccounts(perpetual.id)
        .then((num) => setNumAccounts(Number(num)));
    }
  }, [traderAPI, perpetual.id, setNumAccounts]);

  useEffect(() => {
    if (traderAPI) {
      setMaxLong(undefined);
      setMaxShort(undefined);
      const proxy = traderAPI.getReadOnlyProxyInstance();
      proxy
        .getMaxSignedOpenTradeSizeForPos(perpetual.id, 0, true)
        .then((long) => setMaxLong(ABK64x64ToFloat(long)));
      proxy
        .getMaxSignedOpenTradeSizeForPos(perpetual.id, 0, false)
        .then((short) => setMaxShort(ABK64x64ToFloat(short)));
    }
  }, [traderAPI, perpetual.id, setMaxLong, setMaxShort]);

  // AMM_position + OI_long - OI_short = 0, OI = max(OI_long, OI_short)
  // const OILong = useMemo(() => {
  //   return amm.fPositionBC.lt(0)
  //   ? perpetual.fOpenInterest
  //   : perpetual.fOpenInterest.sub(amm.fPositionBC.abs())
  // }, [perpetual]);

  // const OIShort = amm.fPositionBC.add(OILong);

  const avgPosition = useMemo(() => {
    if (numAccounts) {
      // (OI_long + OI_short) / 2
      return numAccounts > 0
        ? ABK64x64ToFloat(
            perpetual.fOpenInterest.mul(2).sub(amm.fPositionBC.abs())
          ) / numAccounts
        : 0;
    }
  }, [numAccounts, amm.fPositionBC, perpetual.fOpenInterest]);

  // const numLong = useMemo(() => {
  //   if (numAccounts && numAccounts > 0) {
  //     // n_long = OI_long / (OI_long + OI_short) * n
  //     let num = Math.round(
  //       (ABK64x64ToFloat(OILong) / ABK64x64ToFloat(OILong.add(OIShort))) *
  //         numAccounts
  //     );
  //     return num > numAccounts ? numAccounts : num;
  //   }
  // }, [numAccounts, OILong, OIShort]);

  // const numShort = useMemo(() => {
  //   if (numAccounts && numLong && numAccounts > 0) {
  //     return numAccounts - numLong;
  //   }
  // }, [numAccounts, numLong]);

  const accumulatedFunding = useMemo(() => {
    return (
      (((ABK64x64ToFloat(perpetual.fCurrentFundingRate) *
        (Date.now() / 1000 - Number(perpetual.iLastFundingTime))) /
        (8 * 60 * 60)) *
        pxS2S3[0]) /
      pxS2S3[1]
    );
  }, [perpetual.fCurrentFundingRate, perpetual.iLastFundingTime, pxS2S3]);

  const staleOracleLoss = useMemo(() => {
    const S20 = ABK64x64ToFloat(perpetual.fSettlementS2PriceData);
    const S30 = ABK64x64ToFloat(perpetual.fSettlementS3PriceData);
    const pos = ABK64x64ToFloat(amm.fPositionBC);
    const cash =
      ABK64x64ToFloat(amm.fCashCC) -
      (ABK64x64ToFloat(
        perpetual.fUnitAccumulatedFunding.sub(amm.fUnitAccumulatedFundingStart)
      ) +
        accumulatedFunding) *
        pos;
    const bal0 =
      cash + (pos * S20 - ABK64x64ToFloat(amm.fLockedInValueQC)) / S30;
    const bal1 =
      cash +
      (pos * pxS2S3[0] - ABK64x64ToFloat(amm.fLockedInValueQC)) / pxS2S3[1];
    return bal1 - bal0;
  }, [pxS2S3, perpetual, amm, accumulatedFunding]);

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

  // useEffect(() => {
  //   if (traderAPI) {
  //     setBinanceOB(undefined);
  //     getBinanceDepth(traderAPI.getSymbolFromPerpId(perpetual.id)!)
  //       .then((depth) => {
  //         if (depth) {
  //           setBinanceOB(depth);
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         setBinanceOB(undefined);
  //       });
  //   }
  // }, [traderAPI, perpetual.id, setBinanceOB]);

  // useEffect(() => {
  //   if (traderAPI) {
  //     setKuCoinOB(undefined);
  //     getKuCoinDepth(traderAPI.getSymbolFromPerpId(perpetual.id)!)
  //       .then((depth) => {
  //         if (depth) {
  //           console.log(depth);
  //           setKuCoinOB(depth.data);
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         setKuCoinOB(undefined);
  //       });
  //   }
  // }, [traderAPI, perpetual.id, setKuCoinOB]);

  // const priceMoveCost = useCallback(
  //   (pct: number, ob: OrderBookI | undefined) => {
  //     if (traderAPI && ob && ob.bids && ob.asks) {
  //       let costBuy = 0;
  //       let costSell = 0;
  //       const midPrice = 0.5 * (+ob.bids[0][0] + +ob.asks[0][0]);
  //       // long
  //       let found = false;
  //       for (let i = 0; i < ob.asks.length; i++) {
  //         costBuy += +ob.asks[i][0] * +ob.asks[i][1];
  //         if (+ob.asks[i][0] / midPrice >= 1 + pct) {
  //           found = true;
  //           break;
  //         }
  //       }
  //       costBuy = found ? costBuy : NaN;
  //       // short
  //       found = false;
  //       for (let i = 0; i < ob.bids.length; i++) {
  //         costSell += +ob.bids[i][0] * +ob.bids[i][1];
  //         if (+ob.bids[i][0] / midPrice <= 1 - pct) {
  //           found = true;
  //           break;
  //         }
  //       }
  //       costSell = found ? costSell : NaN;
  //       return [costBuy, costSell];
  //     }
  //   },
  //   [traderAPI]
  // );

  const onePctPnL = pctPnL(0.01);

  const adverseRetPnL = useMemo(() => {
    if (amm.fPositionBC.eq(0)) {
      return 0;
    }
    const idx = amm.fPositionBC.lt(0) ? 1 : 0; // amm short -> adverse ret is >0
    const retS2 = Math.exp(ABK64x64ToFloat(perpetual.fStressReturnS2[idx])) - 1;
    const retS3 = Math.exp(ABK64x64ToFloat(perpetual.fStressReturnS3[idx])) - 1;
    const pos = ABK64x64ToFloat(amm.fPositionBC);
    const cash =
      ABK64x64ToFloat(amm.fCashCC) -
      ABK64x64ToFloat(
        perpetual.fUnitAccumulatedFunding.sub(amm.fUnitAccumulatedFundingStart)
      ) *
        pos;
    const bal0 =
      cash * pxS2S3[1] +
      (pos * pxS2S3[0] - ABK64x64ToFloat(amm.fLockedInValueQC));
    const S2 = pxS2S3[0];
    const S3 = pxS2S3[1];
    const L1 = ABK64x64ToFloat(amm.fLockedInValueQC);
    let bal1: number;
    if (perpetual.eCollateralCurrency === COLLATERAL_CURRENCY_BASE) {
      bal1 = cash * (S2 * (1 + retS2)) + (pos * S2 * (1 + retS2) - L1);
    } else if (perpetual.eCollateralCurrency === COLLATERAL_CURRENCY_QUOTE) {
      bal1 = cash + (pos * S2 * (1 + retS2) - L1);
    } else {
      bal1 = cash * (S3 * (1 + retS3)) + (pos * S2 * (1 + retS2) - L1);
    }
    return bal1 - bal0;
  }, [amm, perpetual, pxS2S3]);

  const maxExposureIncrease = useMemo(() => {
    if (amm.fPositionBC.eq(0)) {
      return undefined;
    }
    const idx = amm.fPositionBC.lt(0) ? 1 : 0; // amm short -> adverse ret is >0
    const retS2 = Math.exp(ABK64x64ToFloat(perpetual.fStressReturnS2[idx])) - 1;
    const retS3 = Math.exp(ABK64x64ToFloat(perpetual.fStressReturnS3[idx])) - 1;
    const pos = ABK64x64ToFloat(amm.fPositionBC);
    const cash =
      ABK64x64ToFloat(amm.fCashCC.add(perpetual.fTargetAMMFundSize)) -
      ABK64x64ToFloat(
        perpetual.fUnitAccumulatedFunding.sub(amm.fUnitAccumulatedFundingStart)
      ) *
        pos;

    const S2 = pxS2S3[0];
    const S3 = pxS2S3[1];
    const L1 = ABK64x64ToFloat(amm.fLockedInValueQC);
    let k: number;
    //  |k| < (funds * S3' - K2 * S2' + L1) / |S2' - S20|
    if (perpetual.eCollateralCurrency === COLLATERAL_CURRENCY_BASE) {
      k =
        (cash * (S2 * (1 + retS2)) + pos * S2 * (1 + retS2) - L1) /
        Math.abs(S2 * retS2);
    } else if (perpetual.eCollateralCurrency === COLLATERAL_CURRENCY_QUOTE) {
      k = (cash + pos * S2 * (1 + retS2) - L1) / Math.abs(S2 * retS2);
    } else {
      k =
        (cash * (S3 * (1 + retS3)) + pos * S2 * (1 + retS2) - L1) /
        Math.abs(S2 * retS2);
    }
    return k * (amm.fPositionBC.lt(0) ? 1 : -1);
  }, [amm, perpetual, pxS2S3]);

  const numTradesForTarget = useMemo(() => {
    const target = 0.9;
    const spotTarget = calculateAMMTargetSize(
      ABK64x64ToFloat(perpetual.fAMMTargetDD),
      ABK64x64ToFloat(perpetual.fAMMMinSizeCC),
      ABK64x64ToFloat(perpetual.fSigma2),
      ABK64x64ToFloat(perpetual.fSigma3),
      ABK64x64ToFloat(perpetual.fRho23),
      pxS2S3[0],
      pxS2S3[1],
      -ABK64x64ToFloat(amm.fPositionBC),
      -ABK64x64ToFloat(amm.fLockedInValueQC),
      ABK64x64ToFloat(amm.fCashCC),
      perpetual.eCollateralCurrency
    );
    const curTarget = ABK64x64ToFloat(perpetual.fTargetAMMFundSize);
    if (curTarget >= (1 - target) * spotTarget) {
      return 0;
    }
    return (
      Math.log((1 - target) / (1 - curTarget / spotTarget)) /
      Math.log(ABK64x64ToFloat(perpetual.fDFLambda[0]))
    );
  }, [amm, perpetual, pxS2S3]);
  // const fivePctPnL = pctPnL(0.05);

  // const tenPctPnL = pctPnL(0.1);

  // const onePctBinance = useMemo(() => {
  //   if (binanceOB) {
  //     return priceMoveCost(0.01, binanceOB as OrderBookI);
  //   }
  // }, [binanceOB, priceMoveCost]);

  // const onePctKuCoin = useMemo(() => {
  //   if (kuCoinOB) {
  //     return priceMoveCost(0.01, kuCoinOB as OrderBookI);
  //   }
  // }, [kuCoinOB, priceMoveCost]);

  return (
    (
      <TableRow>
        <TableCell align="right">
          <Typography variant="cellSmall">{perpetual.id}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {numAccounts !== undefined ? numAccounts : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {maxLong !== undefined && maxShort !== undefined
              ? `${formatNumber(maxLong)}/${formatNumber(maxShort)}`
              : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {avgPosition !== undefined ? `${formatNumber(avgPosition)}` : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {staleOracleLoss !== undefined
              ? `${formatNumber(staleOracleLoss)}`
              : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {`${formatNumber(onePctPnL[0])} / ${formatNumber(onePctPnL[1])}`}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {adverseRetPnL ? `${formatNumber(adverseRetPnL)}` : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {maxExposureIncrease ? `${formatNumber(maxExposureIncrease)}` : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {numTradesForTarget ? `${formatNumber(numTradesForTarget)}` : "-"}
          </Typography>
        </TableCell>
        {/* <TableCell align="right">
          <Typography variant="cellSmall">
            {onePctBinance
              ? `${formatNumber(onePctBinance[0])} / ${formatNumber(
                  onePctBinance[1]
                )}`
              : "-"}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {onePctKuCoin
              ? `${formatNumber(onePctKuCoin[0])} / ${formatNumber(
                  onePctKuCoin[1]
                )}`
              : "-"}
          </Typography>
        </TableCell> */}

        {/* <TableCell align="right">
          <Typography variant="cellSmall">
            {`${formatNumber(fivePctPnL[0])} / ${formatNumber(fivePctPnL[1])}`}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {`${formatNumber(tenPctPnL[0])} / ${formatNumber(tenPctPnL[1])}`}
          </Typography>
        </TableCell> */}
      </TableRow>
    ) || null
  );
};
