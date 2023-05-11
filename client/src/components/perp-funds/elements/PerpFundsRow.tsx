import { ABK64x64ToFloat, fromBytes4HexString } from "@d8x/perpetuals-sdk";
import { TableCell, TableRow, Typography } from "@mui/material";
import { useAtom } from "jotai";
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

  const pool = pools?.find((p) => p.id === perpetual.poolId);
  const lpWeight =
    pool && pool.fFundAllocationNormalizationCC.gt(0)
      ? ABK64x64ToFloat(perpetual.fFundAllocationWeightCC) /
        ABK64x64ToFloat(pool.fFundAllocationNormalizationCC)
      : 0;
  const poolCash = pool
    ? lpWeight * ABK64x64ToFloat(pool.fPnLparticipantsCashCC)
    : 0;

  return (
    <TableRow>
      <TableCell align="right">
        <Typography variant="cellSmall">{perpetual.id}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="cellSmall">
          {pool ? `${tokenSymbols?.[pool?.id]}` : "-"}
        </Typography>
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
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(perpetual.fAMMFundCashCC)
        )} (${formatNumber(
          (100 * ABK64x64ToFloat(perpetual.fAMMFundCashCC)) /
            ABK64x64ToFloat(perpetual.fTargetAMMFundSize)
        )}%)`}</Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant="cellSmall">
          {pool
            ? `${formatNumber(poolCash)} (${formatNumber(100 * lpWeight)}%)`
            : "-"}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(account.fCashCC)
        )}`}</Typography>
      </TableCell>

      <TableCell align="right">
        <Typography variant="cellSmall">{`${formatNumber(
          ABK64x64ToFloat(account.fCashCC.add(perpetual.fAMMFundCashCC)) +
            poolCash
        )}`}</Typography>
      </TableCell>
    </TableRow>
  );
}
