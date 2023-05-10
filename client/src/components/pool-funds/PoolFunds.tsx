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

import styles from "./PoolFunds.module.scss";
import { useMemo } from "react";
import { TableHeaderI } from "types/types";
import { AlignE } from "types/enums";
import { EmptyTableRow } from "components/empty-table-row/EmptyTableRow";
import { PoolFundsRow } from "./elements/PoolFundsRow";

export const PoolFunds = () => {
  const tableHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: "Pool Id", align: AlignE.Left },
      { label: "Token", align: AlignE.Right },
      { label: "DF Size", align: AlignE.Left },
      { label: "DF Target", align: AlignE.Left },
      { label: "DF/Target (%)", align: AlignE.Left },
      { label: "AMM Size", align: AlignE.Left },
      { label: "AMM Target", align: AlignE.Left },
      { label: "AMM/Target (%)", align: AlignE.Left },
      { label: "AMM Margin", align: AlignE.Left },
      { label: "LP", align: AlignE.Left },
    ],
    []
  );

  const poolStates = [
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
            {poolStates.map((poolState) => (
              <PoolFundsRow key={poolState.id} {...poolState} />
            ))}
            {poolStates.length === 0 && (
              <EmptyTableRow colSpan={tableHeaders.length} text="No pools" />
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
};
