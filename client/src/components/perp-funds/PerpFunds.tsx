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
import styles from "./PerpFunds.module.scss";
import { PerpFundsRow } from "./elements/PerpFundsRow";
import { ammAccountAtom, perpetualsAtom, poolsAtom } from "store/states.store";
import { useAtom } from "jotai";

export const PerpFunds = () => {
  const tableHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: "Perpetual Id", align: AlignE.Left },
      { label: "Symbol", align: AlignE.Right },
      { label: "DF Target", align: AlignE.Left },
      { label: "AMM Size", align: AlignE.Left },
      { label: "AMM Target", align: AlignE.Left },
      { label: "AMM/Target (%)", align: AlignE.Left },
      { label: "AMM Margin", align: AlignE.Left },
      { label: "LP", align: AlignE.Left },
      { label: "LP (%)", align: AlignE.Left },
    ],
    []
  );

  const [perpetuals] = useAtom(perpetualsAtom);
  const [amms] = useAtom(ammAccountAtom);

  return (
    <Box className={styles.root}>
      <TableContainer className={styles.root}>
        <MuiTable>
          <TableHead className={styles.tableHead}>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableCell key={header.label.toString()} align={header.align}>
                  <Typography variant="bodySmall">{header.label}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className={styles.tableBody}>
            {perpetuals &&
              amms &&
              perpetuals.length > 0 &&
              perpetuals.map((perp, idx) => (
                <PerpFundsRow
                  key={perp.id}
                  perpetual={perp}
                  account={amms[idx]}
                />
              ))}
            {(!perpetuals || perpetuals.length === 0) && (
              <EmptyTableRow
                colSpan={tableHeaders.length}
                text="No perpetuals"
              />
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
};
