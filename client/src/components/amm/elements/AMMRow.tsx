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

  const S2 = ABK64x64ToFloat(perpetual.fSettlementS2PriceData);
  const Sm =
    S2 * (1 + ABK64x64ToFloat(perpetual.currentMarkPremiumRate.fPrice));
  const S3 = ABK64x64ToFloat(perpetual.fSettlementS3PriceData);

  const balance =
    ABK64x64ToFloat(account.fCashCC) -
    ABK64x64ToFloat(
      perpetual.fUnitAccumulatedFunding.sub(
        account.fUnitAccumulatedFundingStart
      )
    ) *
      ABK64x64ToFloat(account.fPositionBC) +
    (ABK64x64ToFloat(account.fPositionBC) * S2 -
      ABK64x64ToFloat(account.fLockedInValueQC)) /
      S3;

  return (
    <TableRow>
      <TableCell align="right">
        <Typography variant="cellSmall">{perpetual.id}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(S2)}`}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(Sm)}`}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(S3)}`}</Typography>
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
          -ABK64x64ToFloat(
            perpetual.fUnitAccumulatedFunding.sub(
              account.fUnitAccumulatedFundingStart
            )
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
          {balance > 0
            ? `${formatNumber(
                (ABK64x64ToFloat(account.fPositionBC.abs()) * (Sm / S3)) /
                  balance,
                1
              )}x`
            : "-"}
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
    </TableRow>
  );
}