import { TableCell, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { marginTokensAtom, tokenBalancesAtom } from "store/states.store";

interface BalanceProp {
  idx: number;
  name: string;
  addr: string;
}

export function BalancesRow({ idx, name, addr }: BalanceProp) {
  const [tokenBalances] = useAtom(tokenBalancesAtom);
  const [marginTokens] = useAtom(marginTokensAtom);

  return (
    <TableRow>
      <TableCell align="right">
        <Typography variant="cellSmall">{name}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">{addr}</Typography>
      </TableCell>
      {/* <TableRow> */}
      {marginTokens &&
        tokenBalances &&
        marginTokens.map((_token, jdx) => (
          <TableCell align="right">
            <Typography variant="cellSmall">
              {" "}
              {`${tokenBalances[jdx][idx]}`}{" "}
            </Typography>
          </TableCell>
        ))}
      {/* </TableRow> */}
    </TableRow>
  );
}
