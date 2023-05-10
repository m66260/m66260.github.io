import { TableCell, TableRow, Typography } from "@mui/material";

interface PoolState {
  id: number;
  fAMMFunds: number;
}

export const PoolFundsRow = (poolState: PoolState) => {
  return (
    <TableRow>
      <TableCell align="left">
        <Typography variant="cellSmall">{poolState.id}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"stMATIC"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"999,000 (df)"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"1,000,000 (df target)"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"99.9 % (df to target)"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"amm"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"amm target"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"amm %"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"amm margin"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"PnL"}</Typography>
      </TableCell>
    </TableRow>
  );
};
