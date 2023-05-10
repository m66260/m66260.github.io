import { TableCell, TableRow, Typography } from "@mui/material";

interface PerpState {
  id: number;
  fAMMFunds: number;
}

export const PerpFundsRow = (poolState: PerpState) => {
  return (
    <TableRow>
      <TableCell align="left">
        <Typography variant="cellSmall">{poolState.id}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"stMATIC"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"1,000,000 (df target)"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"10,000 (amm size)"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"amm target"}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{"amm target %"}</Typography>
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
