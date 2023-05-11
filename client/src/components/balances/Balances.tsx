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
import { useEffect, useMemo } from "react";
import { TableHeaderI } from "types/types";
import { AlignE } from "types/enums";
import { EmptyTableRow } from "components/empty-table-row/EmptyTableRow";
import { BalancesRow } from "./elements/BalancesRow";
import { useAtom } from "jotai";
import {
  allServicesAtom,
  marginTokensAtom,
  tokenSymbolsAtom,
  userAddressAtom,
} from "store/states.store";
import { Services } from "assets/blockchain-services/services";

export const Balances = () => {
  const [marginTokens] = useAtom(marginTokensAtom);
  const [tokenSymbols] = useAtom(tokenSymbolsAtom);
  const [userAddress] = useAtom(userAddressAtom);
  const [allServices, setAllServices] = useAtom(allServicesAtom);

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

  useEffect(() => {
    if (userAddress) {
      setAllServices(
        [{ service: "You", address: userAddress }].concat(Services)
      );
    } else {
      setAllServices(null);
    }
  }, [userAddress, setAllServices]);

  return (
    <TableContainer>
      <TableHead className={styles.root}>
        {
          <Typography variant="overline" align="inherit">
            {"Services"}
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
                {marginTokens &&
                  allServices &&
                  allServices.map((service, idx) => (
                    <BalancesRow
                      idx={idx}
                      name={service.service}
                      addr={service.address}
                    />
                  ))}
                {(!marginTokens || marginTokens.length === 0) && (
                  <EmptyTableRow
                    colSpan={tableHeaders.length}
                    text="No services"
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
