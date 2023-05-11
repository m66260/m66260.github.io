import { ABK64x64ToFloat } from "@d8x/perpetuals-sdk";
import { TableCell, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
import {
  marginTokensAtom,
  tokenBalancesAtom,
  tokenSymbolsAtom,
} from "store/states.store";
import { PerpStorage } from "types/IPerpetualManager";
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
