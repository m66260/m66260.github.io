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
import { useAtom } from "jotai";
import { poolsAtom } from "store/states.store";

export const PoolFunds = () => {
  const tableHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: "Pool Id", align: AlignE.Left },
      { label: "Token", align: AlignE.Right },
      { label: "DF Target", align: AlignE.Left },
      { label: "DF/Target (%)", align: AlignE.Left },
      { label: "AMM Target", align: AlignE.Left },
      { label: "AMM/Target (%)", align: AlignE.Left },
      { label: "DF", align: AlignE.Left },
      { label: "AMM Fund", align: AlignE.Left },
      { label: "PnL Fund", align: AlignE.Left },
      { label: "Total", align: AlignE.Left },
    ],
    []
  );

  const [pools] = useAtom(poolsAtom);

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
            {pools &&
              pools.length > 0 &&
              pools.map((pool) => <PoolFundsRow key={pool.id} {...pool} />)}
            {(!pools || pools.length === 0) && (
              <EmptyTableRow colSpan={tableHeaders.length} text="No pools" />
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
};
