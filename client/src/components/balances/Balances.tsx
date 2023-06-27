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
import { fetchBalance } from "@wagmi/core";
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
  tokenBalancesAtom,
  tokenSymbolsAtom,
  userAddressAtom,
} from "store/states.store";
import { Services } from "assets/blockchain-services/services";

export const Balances = () => {
  const [marginTokens] = useAtom(marginTokensAtom);
  const [tokenSymbols] = useAtom(tokenSymbolsAtom);
  const [userAddress] = useAtom(userAddressAtom);
  const [allServices, setAllServices] = useAtom(allServicesAtom);
  const [, setTokenBalances] = useAtom(tokenBalancesAtom);
  const [, setTokenSymbols] = useAtom(tokenSymbolsAtom);

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
    setAllServices(null);
    if (userAddress) {
      setAllServices(
        [{ service: "You", address: userAddress }].concat(Services)
      );
    }
  }, [userAddress, setAllServices]);

  const tokenBalances = useMemo(() => {
    if (marginTokens && allServices) {
      return Promise.all(
        marginTokens.map((token) => {
          return Promise.all(
            allServices.map((s) => {
              return fetchBalance({
                address: s.address as `0x${string}`,
                token: token.length > 0 ? (token as `0x${string}`) : undefined,
              }).then((balance) => {
                return balance;
              });
            })
          );
        })
      );
    }
  }, [marginTokens, allServices]);

  useEffect(() => {
    if (tokenBalances) {
      tokenBalances.then((balances) => {
        setTokenBalances(balances.map((t) => t.map((ta) => ta.formatted)));
        setTokenSymbols(balances.map((t) => t[0].symbol));
      });
    }
  }, [tokenBalances, setTokenBalances, setTokenSymbols]);

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
                  {tableHeaders.map((header, idx) => (
                    <TableCell key={idx} align={header.align}>
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
                      key={service.address}
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
