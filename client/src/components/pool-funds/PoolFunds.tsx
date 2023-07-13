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
      { label: "Pool", align: AlignE.Left },
      { label: "Token", align: AlignE.Left },
      { label: "Target DF", align: AlignE.Right },
      { label: "Target AMM", align: AlignE.Right },
      { label: "Default Fund", align: AlignE.Right },
      { label: "PnL Fund", align: AlignE.Right },
      { label: "Broker Fund", align: AlignE.Right },
      { label: "Total", align: AlignE.Right },
    ],
    []
  );

  const [pools] = useAtom(poolsAtom);

  return (
    <TableContainer>
      <TableHead className={styles.root}>
        {
          <Typography variant="overline" align="inherit">
            Liquidity
          </Typography>
        }
      </TableHead>
      <TableBody>
        <Box className={styles.root}>
          <TableContainer className={styles.root}>
            <MuiTable>
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell />
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
                {pools &&
                  pools.length > 0 &&
                  pools.map((pool) => <PoolFundsRow key={pool.id} {...pool} />)}
                {(!pools || pools.length === 0) && (
                  <EmptyTableRow
                    colSpan={tableHeaders.length}
                    text="No pools"
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
