import { TableCell, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { marginTokensAtom, tokenBalancesAtom } from "store/states.store";
import { cutAddressName } from "utils/cutAddressName";
import { formatNumber } from "utils/formatNumber";

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
      <TableCell align="left">
        <Typography variant="cellSmall">{name}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">{cutAddressName(addr)}</Typography>
      </TableCell>
      {/* <TableRow> */}
      {marginTokens &&
        tokenBalances &&
        marginTokens
          .filter((token) => token !== "")
          .map((_token, jdx) => (
            <TableCell align="right">
              <Typography variant="cellSmall">
                {" "}
                {`${formatNumber(Number(tokenBalances[jdx][idx]), 3)}`}{" "}
              </Typography>
            </TableCell>
          ))}
      {/* </TableRow> */}
    </TableRow>
  );
}
