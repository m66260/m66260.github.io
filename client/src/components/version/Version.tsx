import { Box, Container, Typography } from "@mui/material";

import styles from "./Version.module.scss";
import { traderAPIAtom } from "store/states.store";
import { useAtom } from "jotai";
import { D8X_SDK_VERSION } from "@d8x/perpetuals-sdk";

export const Version = () => {
  const [traderAPI] = useAtom(traderAPIAtom);
  return (
    <Container className={styles.columnContainer}>
      <Container className={styles.sidesContainer}>
        <Box>
          <Typography variant="overline">{"Perpetual Manager: "}</Typography>
        </Box>
        <Box className={styles.inherit}>
          <Typography variant="cellSmall">
            {" "}
            {traderAPI ? traderAPI.getProxyAddress() : "-"}{" "}
          </Typography>
        </Box>
      </Container>
      <Container className={styles.sidesContainer}>
        <Box className={styles.leftBlock}>
          <Typography variant="overline">{"Node SDK: "}</Typography>
        </Box>
        <Box className={styles.rightBlock}>
          <Typography variant="cellSmall">{`v${D8X_SDK_VERSION}`}</Typography>
        </Box>
      </Container>
    </Container>
  );
};
