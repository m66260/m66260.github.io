import {
  ABK64x64ToFloat,
  PERP_STATE_STR,
  floatToABK64x64,
} from "@d8x/perpetuals-sdk";
import { TableCell, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { poolsAtom } from "store/states.store";

import { PerpStorage } from "types/IPerpetualManager";
import { formatNumber } from "utils/formatNumber";

interface AMMPropI {
  perpetual: PerpStorage.PerpetualDataStructOutput;
  account: PerpStorage.MarginAccountStructOutput;
  pxS2S3: [number, number];
}

export const AMMRow = ({ perpetual, account, pxS2S3 }: AMMPropI) => {
  const [pools] = useAtom(poolsAtom);

  const [OIMax, OIMin] = useMemo(() => {
    return [
      perpetual.fOpenInterest,
      perpetual.fOpenInterest.sub(account.fPositionBC.abs()),
    ];
  }, [perpetual, account]);

  const [OILong, OIShort] = useMemo(() => {
    return account.fPositionBC.gt(0) ? [OIMin, OIMax] : [OIMax, OIMin];
  }, [OIMax, OIMin, account]);

  const [S2OnChain, S2, Sm] = useMemo(() => {
    return [
      ABK64x64ToFloat(perpetual.fSettlementS2PriceData),
      pxS2S3[0],
      pxS2S3[0] *
        (1 + ABK64x64ToFloat(perpetual.currentMarkPremiumRate.fPrice)),
    ];
  }, [perpetual, pxS2S3]);

  const [S3OnChain, S3] = useMemo(() => {
    return [ABK64x64ToFloat(perpetual.fSettlementS3PriceData), pxS2S3[1]];
  }, [perpetual, pxS2S3]);

  const accumulatedFunding = useMemo(() => {
    return (
      (((ABK64x64ToFloat(perpetual.fCurrentFundingRate) *
        (Date.now() / 1000 - Number(perpetual.iLastFundingTime))) /
        (8 * 60 * 60)) *
        S2) /
      S3
    );
  }, [perpetual, S2, S3]);

  const balance = useMemo(() => {
    return (
      ABK64x64ToFloat(account.fCashCC) -
      (ABK64x64ToFloat(
        perpetual.fUnitAccumulatedFunding.sub(
          account.fUnitAccumulatedFundingStart
        )
      ) +
        accumulatedFunding) *
        ABK64x64ToFloat(account.fPositionBC) +
      (ABK64x64ToFloat(account.fPositionBC) * S2 -
        ABK64x64ToFloat(account.fLockedInValueQC)) /
        S3
    );
  }, [S2, S3, accumulatedFunding, perpetual, account]);

  const pool = useMemo(() => {
    if (pools) {
      return pools.find((p) => p.id === perpetual.poolId);
    }
  }, [pools, perpetual.poolId]);

  let poolCash = useMemo(() => {
    if (!pool || !perpetual) {
      return;
    }
    return pool.fTargetAMMFundSize.lte(pool.fPnLparticipantsCashCC)
      ? ABK64x64ToFloat(perpetual.fTargetAMMFundSize)
      : (ABK64x64ToFloat(perpetual.fTargetAMMFundSize) *
          ABK64x64ToFloat(pool.fPnLparticipantsCashCC)) /
          ABK64x64ToFloat(pool.fTargetAMMFundSize);
  }, [pool, perpetual]);

  const posValue = ABK64x64ToFloat(account.fPositionBC.abs()) * (Sm / S3);

  // cash locked because AMM made a loss
  const lockedCash = useMemo(() => {
    if (!poolCash) {
      return;
    }
    let cash =
      ABK64x64ToFloat(perpetual.fInitialMarginRate) * posValue - balance; // (balance + x) / posValue = m_r -> x = m_r * posValue - balance
    // cash locked because the AMM account needs positive cash
    return account.fCashCC.gt(0)
      ? Math.max(cash, ABK64x64ToFloat(account.fCashCC))
      : cash;
  }, [poolCash, posValue, balance, perpetual, account]);

  const poolUtilization = useMemo(() => {
    if (!lockedCash || !poolCash) {
      return;
    }
    if (lockedCash <= 0) {
      return 0;
    } else {
      return lockedCash / poolCash;
    }
  }, [lockedCash, poolCash]);

  return (
    (
      <TableRow>
        <TableCell align="right">
          <Typography variant="cellSmall">{perpetual.id}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {PERP_STATE_STR[perpetual.state]}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(S2)} (${formatNumber(
            S2OnChain
          )})`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(Sm)}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(S3)} (${formatNumber(
            S3OnChain
          )})`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            ABK64x64ToFloat(account.fCashCC)
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            ABK64x64ToFloat(account.fPositionBC)
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            ABK64x64ToFloat(account.fLockedInValueQC)
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            -(
              ABK64x64ToFloat(
                perpetual.fUnitAccumulatedFunding.sub(
                  account.fUnitAccumulatedFundingStart
                )
              ) + accumulatedFunding
            ) * ABK64x64ToFloat(account.fPositionBC)
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            balance
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            (ABK64x64ToFloat(account.fPositionBC.abs()) * Sm) / S3 / balance
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {`${formatNumber(lockedCash ?? 0)} (${formatNumber(
              (poolUtilization ?? 0) * 100
            )}%)`}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            ABK64x64ToFloat(OILong ?? floatToABK64x64(0))
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            ABK64x64ToFloat(OIShort ?? floatToABK64x64(0))
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            ABK64x64ToFloat(perpetual.fkStar)
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            ABK64x64ToFloat(perpetual.fCurrentTraderExposureEMA)
          )}`}</Typography>
        </TableCell>
      </TableRow>
    ) || null
  );
};
