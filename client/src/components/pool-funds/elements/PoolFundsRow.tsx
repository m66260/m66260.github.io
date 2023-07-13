import { ABK64x64ToFloat } from "@d8x/perpetuals-sdk";
import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useAtom } from "jotai";
import { Fragment, useState } from "react";
import { tokenSymbolsAtom } from "store/states.store";
import { PerpStorage } from "types/IPerpetualManager";
// import { cutAddressName } from "utils/cutAddressName";
import { formatNumber } from "utils/formatNumber";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { PerpFunds } from "components/perp-funds/PerpFunds";

export const PoolFundsRow = (
  pool: PerpStorage.LiquidityPoolDataStructOutput
) => {
  const [tokenSymbols] = useAtom(tokenSymbolsAtom);
  // const [marginTokens] = useAtom(marginTokensAtom);

  const [isOpen, setOpen] = useState(false);

  return (
    <Fragment>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!isOpen)}
          >
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {/* pool row */}
        <TableCell align="left">
          <Typography variant="cellSmall">{pool.id}</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="cellSmall">
            {tokenSymbols ? `${tokenSymbols[pool.id]}` : "-"}
          </Typography>
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
            ABK64x64ToFloat(pool.fPnLparticipantsCashCC)
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            ABK64x64ToFloat(
              pool.fPnLparticipantsCashCC.add(pool.fDefaultFundCashCC)
            )
          )}`}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">{`${formatNumber(
            ABK64x64ToFloat(pool.fBrokerFundCashCC)
          )}`}</Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {/* perp funds table */}
              <PerpFunds poolId={pool.id} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};
