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

import styles from "./Balances.module.scss";
import { useMemo } from "react";
import { TableHeaderI } from "types/types";
import { AlignE } from "types/enums";
import { EmptyTableRow } from "components/empty-table-row/EmptyTableRow";
import { BalancesRow } from "./elements/BalancesRow";
import { useAtom } from "jotai";
import { marginTokensAtom, tokenSymbolsAtom } from "store/states.store";
import { WALLETS } from "assets/wallets/wallets";

export const Balances = () => {
  const [marginTokens] = useAtom(marginTokensAtom);
  const [tokenSymbols] = useAtom(tokenSymbolsAtom);

  const tableHeaders: TableHeaderI[] = useMemo(
    () =>
      [
        { label: "Name", align: AlignE.Left },
        { label: "Address", align: AlignE.Left },
      ].concat(
        tokenSymbols?.map((token) => {
          return { label: token, align: AlignE.Right };
        }) || []
      ),
    [tokenSymbols]
  );

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
            {marginTokens &&
              marginTokens.length > 0 &&
              WALLETS.map((service, idx) => (
                <BalancesRow
                  idx={idx}
                  name={service.service}
                  addr={service.address}
                />
              ))}
            {(!marginTokens || marginTokens.length === 0) && (
              <EmptyTableRow colSpan={tableHeaders.length} text="No pools" />
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
};
