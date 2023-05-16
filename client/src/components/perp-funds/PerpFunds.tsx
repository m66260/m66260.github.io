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
import { ammAccountAtom, perpetualsAtom } from "store/states.store";
import { useAtom } from "jotai";

interface PerpRowPropsI {
  poolId: number;
}

export const PerpFunds = ({ poolId }: PerpRowPropsI) => {
  const [perpetuals] = useAtom(perpetualsAtom);
  const [amms] = useAtom(ammAccountAtom);

  const tableHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: "Perpetual", align: AlignE.Left },
      // { label: "Collateral", align: AlignE.Left },
      { label: "Index", align: AlignE.Left },
      { label: "Target DF", align: AlignE.Right },
      { label: "Target AMM", align: AlignE.Right },
      { label: "AMM Fund", align: AlignE.Right },
      { label: "PnL Fund", align: AlignE.Right },
      { label: "AMM Margin", align: AlignE.Right },
      { label: "Total", align: AlignE.Right },
    ],
    []
  );

  return (
    <TableContainer>
      {/* <TableHead className={styles.root}>
        {
          <Typography variant="overline" align="inherit">
            {"Perpetuals"}
          </Typography>
        }
      </TableHead> */}
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
                  perpetuals.length > 0 &&
                  perpetuals
                    .filter((perp) => perp.poolId === poolId)
                    .map((perp, idx) => (
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
      </TableBody>
    </TableContainer>
  );
};
