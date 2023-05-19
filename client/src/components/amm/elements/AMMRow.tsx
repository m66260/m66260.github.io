import {
  ABDK29ToFloat,
  ABK64x64ToFloat,
  PERP_STATE_STR,
} from "@d8x/perpetuals-sdk";
import { TableCell, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
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

  const OI1 = perpetual.fOpenInterest;
  // if (OI1.eq(0)) {
  //   return null;
  // }
  const OI2 = perpetual.fOpenInterest.sub(account.fPositionBC.abs());
  const OILong = account.fPositionBC.gt(0) ? OI2 : OI1;
  const OIShort = account.fPositionBC.gt(0) ? OI1 : OI2;

  const S2OnChain = ABK64x64ToFloat(perpetual.fSettlementS2PriceData);
  const S2 = pxS2S3[0]; //
  const Sm =
    pxS2S3[0] * (1 + ABK64x64ToFloat(perpetual.currentMarkPremiumRate.fPrice));

  const S3OnChain = ABK64x64ToFloat(perpetual.fSettlementS3PriceData);
  const S3 = pxS2S3[1];

  const accumulatedFunding =
    (((ABK64x64ToFloat(perpetual.fCurrentFundingRate) *
      (Date.now() / 1000 - Number(perpetual.iLastFundingTime))) /
      (8 * 60 * 60)) *
      S2) /
    S3;

  const balance =
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
      S3;

  const pool = pools?.find((p) => p.id === perpetual.poolId);
  const lpWeight =
    pool && pool.fFundAllocationNormalizationCC.gt(0)
      ? ABK64x64ToFloat(perpetual.fFundAllocationWeightCC) /
        ABK64x64ToFloat(pool.fFundAllocationNormalizationCC)
      : 0;
  // const poolCash = pool
  //   ? lpWeight * ABK64x64ToFloat(pool.fPnLparticipantsCashCC)
  //   : 0;

  // const totalBalance =
  //   balance + ABK64x64ToFloat(perpetual.fAMMFundCashCC) + poolCash;

  let poolUtilization: number;

  const posValue = ABK64x64ToFloat(account.fPositionBC.abs()) * (Sm / S3);

  // cash locked because AMM made a loss
  let lockedCash =
    ABK64x64ToFloat(perpetual.fInitialMarginRate) * posValue - balance; // (balance + x) / posValue = m_r -> x = m_r * posValue - balance
  // cash locked because the AMM account needs positive cash
  lockedCash = account.fCashCC.gt(0)
    ? Math.max(lockedCash, ABK64x64ToFloat(account.fCashCC))
    : lockedCash;

  if (lockedCash <= 0) {
    poolUtilization = 0;
    lockedCash = 0;
  } else {
    const poolCash = pool
      ? lpWeight * ABK64x64ToFloat(pool.fPnLparticipantsCashCC)
      : 0;
    poolUtilization =
      lockedCash / (ABK64x64ToFloat(perpetual.fAMMFundCashCC) + poolCash);
  }

  return (
    (account &&
      OILong !== undefined &&
      OIShort !== undefined &&
      balance !== undefined && (
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
            <Typography variant="cellSmall">{`${formatNumber(
              S2
            )} (${formatNumber(S2OnChain)})`}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="cellSmall">{`${formatNumber(Sm)}`}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="cellSmall">{`${formatNumber(
              S3
            )} (${formatNumber(S3OnChain)})`}</Typography>
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
            <Typography variant="cellSmall">
              {`${formatNumber(lockedCash)} (${formatNumber(
                poolUtilization * 100
              )}%)`}
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="cellSmall">{`${formatNumber(
              ABK64x64ToFloat(OILong)
            )}`}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="cellSmall">{`${formatNumber(
              ABK64x64ToFloat(OIShort)
            )}`}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="cellSmall">{`${formatNumber(
              ABK64x64ToFloat(perpetual.fkStar)
            )}`}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography variant="cellSmall">{`${formatNumber(
              ABDK29ToFloat(perpetual.fCurrentTraderExposureEMA)
            )}`}</Typography>
          </TableCell>
        </TableRow>
      )) ||
    null
  );
};
