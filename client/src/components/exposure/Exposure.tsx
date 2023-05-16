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
import { useMemo } from "react";
import { AlignE } from "types/enums";
import { TableHeaderI } from "types/types";
import styles from "./Exposure.module.scss";
import { ExposureRow } from "./elements/ExposureRow";
import { ammAccountAtom, perpetualsAtom, pxS2S3Atom } from "store/states.store";
import { useAtom } from "jotai";

export const Exposure = () => {
  const [perpetuals] = useAtom(perpetualsAtom);
  const [amms] = useAtom(ammAccountAtom);
  const [pxS2S3] = useAtom(pxS2S3Atom);

  const tableHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: "Perpetual", align: AlignE.Left },
      { label: "Traders", align: AlignE.Left },
      { label: "Avg Position", align: AlignE.Left },
      { label: "Stale Oracle PnL", align: AlignE.Left },
      { label: "Price move: ±1%", align: AlignE.Left },
      { label: "Cost Binance", align: AlignE.Left },
      { label: "Cost KuCoin", align: AlignE.Left },
      // { label: "Price move: ±10%", align: AlignE.Left },
    ],
    []
  );

  return (
    <TableContainer>
      <TableHead className={styles.root}>
        {
          <Typography variant="overline" align="inherit">
            {"Exposure"}
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
                    <ExposureRow
                      key={perp.id}
                      perpetual={perp}
                      amm={amms[idx]}
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
