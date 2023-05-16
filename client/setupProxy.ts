import { createProxyMiddleware } from "http-proxy-middleware";

module.exports = function (app) {
  app.use(
    "/**",
    createProxyMiddleware({
      target: "https://api.binance.com",
      changeOrigin: true,
    })
  );
};
