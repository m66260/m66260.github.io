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
import styles from "./AMM.module.scss";
import { AMMRow } from "./elements/AMMRow";
import { ammAccountAtom, perpetualsAtom } from "store/states.store";
import { useAtom } from "jotai";

export const AMM = () => {
  const tableHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: "Perpetual Id", align: AlignE.Left },
      { label: "S2", align: AlignE.Left },
      { label: "Sm", align: AlignE.Left },
      { label: "S3", align: AlignE.Left },
      { label: "Margin", align: AlignE.Left },
      { label: "Position", align: AlignE.Left },
      { label: "Locked-In", align: AlignE.Left },
      { label: "Unpaid Funding", align: AlignE.Left },
      { label: "OI (long)", align: AlignE.Left },
      { label: "OI (short)", align: AlignE.Left },
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
                <AMMRow key={perp.id} perpetual={perp} account={amms[idx]} />
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
