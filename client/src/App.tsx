import React from "react";
import { memo } from "react";
import { Route, Routes } from "react-router-dom";

import { Box } from "@mui/material";

import { StaticBackground } from "components/static-background/StaticBackground";
import { RiskPage } from "pages/risk-page/RiskPage";

import "@rainbow-me/rainbowkit/styles.css";

import styles from "./App.module.scss";

export const App = memo(() => {
  return (
    <Box className={styles.root}>
      <StaticBackground />
      <Routes>
        <Route key="risk-page" path="*" element={<RiskPage />} />
      </Routes>
    </Box>
  );
});
