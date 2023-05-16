// import { useAtom } from 'jotai';

import {
  Box,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { EmptyTableRow } from "components/empty-table-row/EmptyTableRow";
import { useEffect, useMemo } from "react";
import { AlignE } from "types/enums";
import { TableHeaderI } from "types/types";
import styles from "./AMM.module.scss";
import { AMMRow } from "./elements/AMMRow";
import {
  ammAccountAtom,
  perpetualsAtom,
  pxS2S3Atom,
  traderAPIAtom,
} from "store/states.store";
import { useAtom } from "jotai";
import {
  COLLATERAL_CURRENCY_BASE,
  COLLATERAL_CURRENCY_QUOTE,
} from "@d8x/perpetuals-sdk";

export const AMM = () => {
  const [perpetuals] = useAtom(perpetualsAtom);
  const [amms] = useAtom(ammAccountAtom);
  const [pxS2S3, setPxS2S3] = useAtom(pxS2S3Atom);
  const [traderAPI] = useAtom(traderAPIAtom);

  useEffect(() => {
    if (traderAPI && perpetuals) {
      setPxS2S3(null);
      console.log("Fetching prices...");
      Promise.all(
        perpetuals.map(({ id, eCollateralCurrency }) => {
          const symbol = traderAPI.getSymbolFromPerpId(id)!;
          return traderAPI
            .fetchPriceSubmissionInfoForPerpetual(symbol)
            .then(({ pxS2S3 }) => {
              const S2 = pxS2S3[0];
              let S3: number;
              if (eCollateralCurrency === COLLATERAL_CURRENCY_QUOTE) {
                S3 = 1;
              } else if (eCollateralCurrency === COLLATERAL_CURRENCY_BASE) {
                S3 = S2;
              } else {
                S3 = pxS2S3[1];
              }
              return [S2, S3] as [number, number];
            });
        })
      ).then((prices) => {
        setPxS2S3(prices);
      });
    }
  }, [perpetuals, traderAPI, setPxS2S3]);

  const tableHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: "Perpetual", align: AlignE.Left },
      { label: "S2", align: AlignE.Left },
      { label: "Sm", align: AlignE.Left },
      { label: "S3", align: AlignE.Left },
      { label: "Margin", align: AlignE.Left },
      { label: "Position", align: AlignE.Left },
      { label: "Locked-In", align: AlignE.Left },
      { label: "Funding", align: AlignE.Left },
      { label: "Balance", align: AlignE.Left },
      { label: "Locked liquidity", align: AlignE.Left },
      { label: "Long OI", align: AlignE.Left },
      { label: "Short OI", align: AlignE.Left },
    ],
    []
  );

  return (
    <TableContainer>
      <TableHead className={styles.root}>
        {
          <Typography variant="overline" align="inherit">
            {"AMM"}
          </Typography>
        }
      </TableHead>
      <TableBody>
        <Box className={styles.root}>
          <TableContainer className={styles.root}>
            <MuiTable>
              <TableHead className={styles.tableHead}>
                <TableRow>
                  {tableHeaders.map((header) => (
                    <TableCell
                      key={header.label.toString()}
                      align={header.align}
                    >
                      <Typography variant="bodySmall">
                        {header.label}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody className={styles.tableBody}>
                {perpetuals &&
                  amms &&
                  pxS2S3 &&
                  perpetuals.length > 0 &&
                  perpetuals.map((perp, idx) => (
                    <AMMRow
                      key={perp.id}
                      perpetual={perp}
                      account={amms[idx]}
                      pxS2S3={pxS2S3[idx]}
                    />
                  ))}
                {(!perpetuals || perpetuals.length === 0) && (
                  <EmptyTableRow
                    colSpan={tableHeaders.length}
                    text="No active AMMs"
                  />
                )}
              </TableBody>
            </MuiTable>
          </TableContainer>
        </Box>
      </TableBody>
    </TableContainer>
  );
};
