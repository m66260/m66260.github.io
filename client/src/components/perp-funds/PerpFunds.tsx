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

export const PerpFunds = () => {
  const tableHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: "ID", align: AlignE.Left },
      { label: "Symbol", align: AlignE.Right },
      { label: "DF Target", align: AlignE.Left },
      { label: "AMM Size", align: AlignE.Left },
      { label: "AMM Target", align: AlignE.Left },
      { label: "AMM/Target (%)", align: AlignE.Left },
      { label: "AMM Margin", align: AlignE.Left },
      { label: "PnL Part", align: AlignE.Left },
    ],
    []
  );

  const perpStates = [
    { id: 1, fAMMFunds: 1000 },
    { id: 2, fAMMFunds: 2000 },
  ];

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
            {perpStates.map((perpState) => (
              <PerpFundsRow key={perpState.id} {...perpState} />
            ))}
            {perpStates.length === 0 && (
              <EmptyTableRow colSpan={tableHeaders.length} text="No pools" />
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
};
