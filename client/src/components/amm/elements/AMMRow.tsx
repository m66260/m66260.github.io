import { ABK64x64ToFloat } from "@d8x/perpetuals-sdk";
import { TableCell, TableRow, Typography } from "@mui/material";

import { PerpStorage } from "types/IPerpetualManager";
import { formatNumber } from "utils/formatNumber";

interface AMMPropI {
  perpetual: PerpStorage.PerpetualDataStructOutput;
  account: PerpStorage.MarginAccountStructOutput;
}

export function AMMRow({ perpetual, account }: AMMPropI) {
  const OI1 = perpetual.fOpenInterest;
  const OI2 = perpetual.fOpenInterest.sub(account.fPositionBC.abs());
  const OILong = account.fPositionBC.gt(0) ? OI2 : OI1;
  const OIShort = account.fPositionBC.gt(0) ? OI1 : OI2;

  return (
    <TableRow>
      <TableCell align="left">
        <Typography variant="cellSmall">{perpetual.id}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(perpetual.fSettlementS2PriceData)
        )}`}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(perpetual.fSettlementS2PriceData) *
            (1 + ABK64x64ToFloat(perpetual.currentMarkPremiumRate.fPrice))
        )}`}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(perpetual.fSettlementS3PriceData)
        )}`}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(account.fCashCC)
        )}`}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(account.fPositionBC)
        )}`}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(account.fLockedInValueQC)
        )}`}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(
            perpetual.fUnitAccumulatedFunding.sub(
              account.fUnitAccumulatedFundingStart
            )
          )
        )}`}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(OILong)
        )}`}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(OIShort)
        )}`}</Typography>
      </TableCell>
    </TableRow>
  );
}
