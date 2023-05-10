import { ABK64x64ToFloat } from "@d8x/perpetuals-sdk";
import { TableCell, TableRow, Typography } from "@mui/material";
import { PerpStorage } from "types/IPerpetualManager";
import { formatNumber } from "utils/formatNumber";

export const PoolFundsRow = (
  pool: PerpStorage.LiquidityPoolDataStructOutput
) => {
  return (
    <TableRow>
      <TableCell align="right">
        <Typography variant="cellSmall">{pool.id}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">{"---"}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(pool.fTargetDFSize)
        )}`}</Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(pool.fTargetAMMFundSize)
        )}`}</Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(pool.fDefaultFundCashCC)
        )} (${formatNumber(
          (100 * ABK64x64ToFloat(pool.fDefaultFundCashCC)) /
            ABK64x64ToFloat(pool.fTargetDFSize)
        )}%)`}</Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(pool.fAMMFundCashCC)
        )} (${formatNumber(
          (100 * ABK64x64ToFloat(pool.fAMMFundCashCC)) /
            ABK64x64ToFloat(pool.fTargetAMMFundSize)
        )}%)`}</Typography>
      </TableCell>

      {/* <TableCell align="left">
        <Typography variant="cellSmall">{"amm margin"}</Typography>
      </TableCell> */}
      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(pool.fPnLparticipantsCashCC)
        )}`}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(
            pool.fPnLparticipantsCashCC
              .add(pool.fDefaultFundCashCC)
              .add(pool.fAMMFundCashCC)
          )
        )}`}</Typography>
      </TableCell>
    </TableRow>
  );
};
