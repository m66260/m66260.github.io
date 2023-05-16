import { BinanceDepthI } from "types/types";

const API_URL = "https://api.binance.com/api/v3";

function symbolToBinanceSymbol(symbol: string): string | undefined {
  const ccys = symbol.split("-");
  //   if (['CHF', 'GBP', 'XAU', 'BTC', 'ETH'].some((s) => s === ccys[0])) {
  if (["CHF", "GBP", "XAU"].some((s) => s === ccys[0])) {
    // cannot be traded/manipulated on binance
    return undefined;
  }
  if (ccys[0] === "MATIC") {
    return "MATICUSDT";
  }
  if (ccys[0] === "ETH") {
    return "ETHUSDC";
  }
  if (ccys[0] === "BTC") {
    return "BTCUSDC";
  }
  // add more here...
  // ...
  // normalize USD quote currency to USDT and see what we get
  const quote = ccys[1] === "USDC" || ccys[1] === "USD" ? "USDT" : ccys[1];
  return `${ccys[0]}${quote}`;
}

export function getDepth(
  symbol: string,
  depth?: number
): Promise<BinanceDepthI | undefined> {
  const options = {
    method: "GET",
    "Content-type": "application/json",
  };
  let reqSymbol = symbolToBinanceSymbol(symbol);
  if (!reqSymbol) {
    return Promise.resolve(undefined);
  }
  console.log("Fetching Binance order book for symbol", symbol, "...");
  return fetch(
    `${API_URL}/depth?symbol=${reqSymbol}&limit=${depth ?? 100}`,
    options
  ).then((data) => {
    if (!data.ok) {
      console.error({ data });
      return undefined;
      //   throw new Error(data.statusText);
    }
    return data.json();
  });
}
