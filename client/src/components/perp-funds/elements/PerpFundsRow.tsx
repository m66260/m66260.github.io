import { ABK64x64ToFloat, fromBytes4HexString } from "@d8x/perpetuals-sdk";
import { TableCell, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { poolsAtom, tokenSymbolsAtom } from "store/states.store";
import { PerpStorage } from "types/IPerpetualManager";
import { formatNumber } from "utils/formatNumber";

interface PerpFundsPropI {
  perpetual: PerpStorage.PerpetualDataStructOutput;
  account: PerpStorage.MarginAccountStructOutput;
}

export function PerpFundsRow({ perpetual, account }: PerpFundsPropI) {
  const [pools] = useAtom(poolsAtom);
  const [tokenSymbols] = useAtom(tokenSymbolsAtom);

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

  return (
    <TableRow>
      <TableCell align="left">
        <Typography variant="cellSmall">{perpetual.id}</Typography>
      </TableCell>

      <TableCell align="left">
        <Typography variant="cellSmall">
          {pool && tokenSymbols
            ? `${fromBytes4HexString(
                perpetual.S2BaseCCY
              )}/${fromBytes4HexString(perpetual.S2QuoteCCY)}`
            : "-"}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(perpetual.fTargetDFSize)
        )}`}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(perpetual.fTargetAMMFundSize)
        )}`}</Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant="cellSmall">
          {poolCash && pool
            ? `${formatNumber(poolCash)} (${formatNumber(
                (100 * poolCash) / ABK64x64ToFloat(pool.fPnLparticipantsCashCC)
              )}%)`
            : "-"}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">
          {account.fCashCC.gt(0)
            ? `${formatNumber(ABK64x64ToFloat(account.fCashCC))}`
            : "0"}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(account.fCashCC) + (poolCash ?? 0)
        )}`}</Typography>
      </TableCell>
    </TableRow>
  );
}
