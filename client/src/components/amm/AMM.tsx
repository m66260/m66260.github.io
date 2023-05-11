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
      { label: "Id", align: AlignE.Left },
      { label: "S2", align: AlignE.Left },
      { label: "Sm", align: AlignE.Left },
      { label: "S3", align: AlignE.Left },
      { label: "Margin", align: AlignE.Left },
      { label: "Position", align: AlignE.Left },
      { label: "Locked-In", align: AlignE.Left },
      { label: "Funding", align: AlignE.Left },
      { label: "Balance", align: AlignE.Left },
      { label: "Leverage", align: AlignE.Left },
      { label: "Long OI", align: AlignE.Left },
      { label: "Short OI", align: AlignE.Left },
    ],
    []
  );

  const [perpetuals] = useAtom(perpetualsAtom);
  const [amms] = useAtom(ammAccountAtom);

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
                  perpetuals.length > 0 &&
                  perpetuals.map((perp, idx) => (
                    <AMMRow
                      key={perp.id}
                      perpetual={perp}
                      account={amms[idx]}
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
