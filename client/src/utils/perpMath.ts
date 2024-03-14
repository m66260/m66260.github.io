import { BigNumber } from "ethers";
const BN = BigNumber;
export const ONE_64x64 = BN.from("0x10000000000000000");
const DECIMALS = BN.from(10).pow(BN.from(18));

// constants based on enums
export const COLLATERAL_CURRENCY_QUOTE = 0;
export const COLLATERAL_CURRENCY_BASE = 1;
export const COLLATERAL_CURRENCY_QUANTO = 2;
export const PerpetualStateINVALID = 0;
export const PerpetualStateINITIALIZING = 1;
export const PerpetualStateNORMAL = 2;
export const PerpetualStateEMERGENCY = 3;
export const PerpetualStateSETTLE = 4;
export const PerpetualStateCLEARED = 5;

/**
 * Determine amount to be deposited into margin account so that the given leverage
 * is obtained when trading a position pos (trade amount = position)
 * Smart contract equivalent: getDepositAmountForLvgPosition with totalFeeRate = 0 and b0 = pos0 = 0.
 * @param {number} pos - target position
 * @param {number} leverage - target leverage
 * @param {number} price - price to trade amount 'pos'
 * @param {number} S2 - index price S2
 * @param {number} S3 - collateral to quote conversion (=S2 if base-collateral, =1 if quote collateral, = index S3 if quanto)
 * @param {number} S2Mark - mark price
 * @param {number} totalFeeRate - total fee rates (PNL participants + treasury fee)
 * @returns {number} Amount to be deposited to have the given leverage when trading into position pos
 */
export function getDepositAmountForLvgPosition(
  pos: number,
  leverage: number,
  price: number,
  S2: number,
  S3: number,
  S2Mark: number,
  totalFeeRate: number
) {
  let a = (Math.abs(pos) * S2Mark) / leverage;
  let pnl = pos * (S2Mark - price);
  let fees = Math.abs(pos) * totalFeeRate * S2;
  return (a - pnl + fees) / S3;
}

/**
 * Determine amount to be deposited into margin account so that the given leverage
 * is obtained when trading a position pos (trade amount = position)
 * Does NOT include fees
 * Smart contract equivalent: calcMarginForTargetLeverage(..., _ignorePosBalance = false & balance = b0)
 * @param {number} pos0 - current position
 * @param {number} b0 - current balance
 * @param {number} tradeAmnt - amount to trade
 * @param {number} targetLvg - target leverage
 * @param {number} price - price to trade amount 'tradeAmnt'
 * @param {number} S3 - collateral to quote conversion (=S2 if base-collateral, =1 if quote collateral, = index S3 if quanto)
 * @param {number} S2Mark - mark price
 * @returns {number} Amount to be deposited to have the given leverage when trading into position pos before fees
 */
export function getDepositAmountForLvgTrade(
  pos0: number,
  b0: number,
  tradeAmnt: number,
  targetLvg: number,
  price: number,
  S3: number,
  S2Mark: number,
  maxLvg?: number
) {
  let pnl = (tradeAmnt * (S2Mark - price)) / S3;
  if (targetLvg == 0) {
    targetLvg = (Math.abs(pos0) * S2Mark) / S3 / b0;
    targetLvg = Math.min(targetLvg, maxLvg!);
  }
  let b = (Math.abs(pos0 + tradeAmnt) * S2Mark) / S3 / targetLvg;
  return -(b0 + pnl - b);
}

/**
 * Determine whether the trader is maintenance margin safe, given the required target margin rate tau.
 * @param {number} tau  - target margin rate (e.g., the maintenance margin rate)
 * @param {number} position  - traders position
 * @param {number} markPrice - mark price
 * @param {number} lockedInValueQC - traders locked in value
 * @param {number} S2 - index price S2, base to quote conversion
 * @param {number} S3 - collateral to quote conversion
 * @param {number} m - trader collateral in collateral currency
 * @returns {number} Amount to be liquidated (in base currency)
 */
export function isTraderMarginSafe(
  tau: number,
  position: number,
  markPrice: number,
  lockedInValueQC: number,
  S2: number,
  S3: number,
  m: number
): boolean {
  let b = calculateMarginBalance(position, markPrice, lockedInValueQC, S3, m);
  let marginRequirement = (Math.abs(position) * tau * S2) / S3;
  return b > marginRequirement;
}

/**
 * Determine amount to be liquidated. If positive sell, if negative buy.
 * @param {number} marginBalanceCC - Current margin balance in collateral currency
 * @param {number} mntncMarginRate - Maintenance margin rate
 * @param {number} targetMarginRate - Margin rate target for after liquidation
 * @param {number} traderPositionBC - Current trader position
 * @param {number} liquidationFee - liquidation fee rate, applied to position size (base currency) being liquidated
 * @param {number} tradingFee - trading fee rate, applied to position size (base currency) being liquidated
 * @param {number} lotSize - lot size (base currency)
 * @param {number} S2 - index price (base to quote)
 * @param {number} S3 - collateral to quote conversion
 * @param {number} Sm - mark price (base to quote conversion)
 * @returns {number} Amount to be liquidated (in base currency)
 */
export function calculateLiquidationAmount(
  marginBalanceCC: number,
  mntncMarginRate: number,
  targetMarginRate: number,
  traderPositionBC: number,
  liquidationFee: number,
  tradingFee: number,
  lotSize: number,
  S3: number,
  S2: number,
  Sm: number
) {
  // console.assert(mntncMarginRate < targetMarginRate);
  if (
    marginBalanceCC * S3 >
    mntncMarginRate * Math.abs(traderPositionBC) * S2
  ) {
    // margin safe
    return 0;
  }
  let f = liquidationFee + tradingFee;
  // if the current margin balance does not exceed the fees,
  // we need to liquidate the whole position
  if (!(marginBalanceCC > (Math.abs(traderPositionBC) * f * S2) / S3)) {
    return traderPositionBC;
  }
  let nom =
    Math.abs(traderPositionBC) * targetMarginRate * Sm - marginBalanceCC * S3;
  let deltapos =
    nom / (Math.sign(traderPositionBC) * (targetMarginRate * Sm - f * S2));
  // now round to lot
  deltapos = growToLot(deltapos, lotSize);
  return deltapos;
}

/**
 * Calculate margin balance in collateral currency for a trader
 * See alternative function below
 * @param {number} pos - position (base currency)
 * @param {number} LockedInValueQC - trader locked in value in quote currency
 * @param {number} S2 - Index S2
 * @param {number} S3 - Index S3 (can be zero if not quanto)
 * @param {number} markPremium - mark price premium in quote currency
 * @param {number} cashCC - collateral
 * @param {number} collateralCurrencyIndex - [0,1,2]
 * @returns {number} margin balance
 */
export function getMarginBalanceCC(
  pos: number,
  LockedInValueQC: number,
  S2: number,
  S3: number,
  markPremium: number,
  cashCC: number,
  collateralCurrencyIndex: number
): number {
  let q2c = getQuote2CollateralFX(S2, S3, collateralCurrencyIndex);
  return (pos * (S2 + markPremium) - LockedInValueQC) * q2c + cashCC;
}

/**
 * Calculate margin balance in collateral currency for a trader
 * See alternative function above
 * @param {number} position  - traders position
 * @param {number} markPrice - mark price
 * @param {number} lockedInValueQC - traders locked in value
 * @param {number} S3 - collateral to quote conversion
 * @param {number} m - trader collateral in collateral currency
 * @returns {number} Amount to be liquidated (in base currency)
 */
export function calculateMarginBalance(
  position: number,
  markPrice: number,
  lockedInValueQC: number,
  S3: number,
  m: number
): number {
  return (position * markPrice - lockedInValueQC) / S3 + m;
}

/**
 * Check whether margin is safe for given marginrate
 * @param {number} pos - position (base currency)
 * @param {number} LockedInValueQC - trader locked in value in quote currency
 * @param {number} S2 - Index S2
 * @param {number} S3 - Index S3 (can be zero if not quanto)
 * @param {number} markPremium - mark price premium in quote currency
 * @param {number} cashCC - collateral
 * @param {number} collateralCurrencyIndex - [COLLATERAL_CURRENCY_BASE, COLLATERAL_CURRENCY_QUOTE, COLLATERAL_CURRENCY_QUANTO]
 * @returns {bool} margin balance > Math.abs(pos) * marginrate * b2c;
 */
export function isMarginSafe(
  pos: number,
  LockedInValueQC: number,
  cashCC: number,
  S2: number,
  S3: number,
  markPremium: number,
  collateralCurrencyIndex: number,
  marginrate: number
): boolean {
  let b2c = getBase2CollateralFX(
    S2,
    S3,
    markPremium,
    collateralCurrencyIndex,
    false
  );
  let M = getMarginBalanceCC(
    pos,
    LockedInValueQC,
    S2,
    S3,
    markPremium,
    cashCC,
    collateralCurrencyIndex
  );
  return M > Math.abs(pos) * marginrate * b2c;
}

export function getQuote2CollateralFX(
  indexS2: number,
  indexS3: number,
  collateralCurrencyIndex: number
): number {
  if (collateralCurrencyIndex === COLLATERAL_CURRENCY_QUOTE) {
    // quote
    return 1;
  } else if (collateralCurrencyIndex === COLLATERAL_CURRENCY_BASE) {
    // base
    return 1 / indexS2;
  } else {
    // console.assert(collateralCurrencyIndex === COLLATERAL_CURRENCY_QUANTO);
    // quanto
    return 1 / indexS3;
  }
}

/**
 * Conversion rate base to collateral
 * @param {number} indexS2 - Contains current S2 price data
 * @param {number} indexS3 - Contains current S3 price data
 * @param {number} markPremium - mark price premium (amount above index in quote currency)
 * @param {number} collateral_currency_index - COLLATERAL_CURRENCY_QUOTE, COLLATERAL_CURRENCY_BASE or COLLATERAL_CURRENCY_QUANTO
 * @param {boolean} atMarkPrice - conversion at spot or mark price
 * @returns {number} conversion rate
 */
export function getBase2CollateralFX(
  indexS2: number,
  indexS3: number,
  markPremium: number,
  collateral_currency_index: number,
  atMarkPrice: boolean
): number {
  let s2 = atMarkPrice ? markPremium + indexS2 : indexS2;
  if (collateral_currency_index === COLLATERAL_CURRENCY_QUOTE) {
    // quote
    return s2;
  } else if (collateral_currency_index === COLLATERAL_CURRENCY_BASE) {
    // base
    return s2 / indexS2;
  } else {
    // quanto
    return s2 / indexS3;
  }
}

/**
 * Round value down (towards zero) to precision
 * @param {number} value - number to be rounded
 * @param {number} lotSize - size of the lot (e.g., 0.0001)
 * @returns {number} rounded value
 */
export function shrinkToLot(value: number, lotSize: number): number {
  if (value < 0) {
    return Math.ceil(value / lotSize) * lotSize;
  }
  return Math.floor(value / lotSize) * lotSize;
}

/**
 * Round value up (away from zero) to precision
 * @param {number} value - number to be rounded
 * @param {number} lotSize - size of the lot (e.g., 0.0001)
 * @returns {number} rounded value
 */
export function growToLot(value: number, lotSize: number): number {
  if (value < 0) {
    return Math.floor(value / lotSize) * lotSize;
  }
  return Math.ceil(value / lotSize) * lotSize;
}

export function calcKStar(
  K2: number,
  L1: number,
  S2: number,
  S3: number,
  M1: number,
  M2: number,
  M3: number,
  rho: number,
  sig2: number,
  sig3: number
) {
  let kStar = M2 - K2;
  if (M3 !== 0) {
    let h = (((S3 / S2) * (rho * sig2 * sig3)) / (sig2 * sig2)) * M3;
    kStar = kStar + h;
  }
  return kStar;
}

function getTargetCollateralM2(
  K2: number,
  S2: number,
  L1: number,
  sigma2: number,
  DDTarget: number
) {
  let mu = -0.5 * sigma2 ** 2;
  let m: number;
  if (L1 < 0 && K2 !== 0) {
    m = K2 - L1 / Math.exp(mu + sigma2 * DDTarget) / S2;
  } else if (L1 > 0 && K2 !== 0) {
    m = K2 - L1 / Math.exp(mu - sigma2 * DDTarget) / S2;
  } else {
    m = -1;
  }
  return m;
}

function getTargetCollateralM1(
  K2: number,
  S2: number,
  L1: number,
  sigma2: number,
  DDTarget: number
) {
  let mu = -0.5 * sigma2 ** 2;
  let m: number;
  if (K2 < 0) {
    m = K2 * S2 * Math.exp(mu + sigma2 * DDTarget) - L1;
  } else if (K2 > 0) {
    m = K2 * S2 * Math.exp(mu - sigma2 * DDTarget) - L1;
  } else {
    m = -1;
  }
  return m;
}

function getTargetCollateralM3(
  K2: number,
  S2: number,
  S3: number,
  L1: number,
  sigma2: number,
  sigma3: number,
  rho23: number,
  r: number,
  DDTarget: number
) {
  if (K2 === 0) {
    return -1;
  }
  let kappa = L1 / S2 / K2;
  let a = Math.exp(sigma3 ** 2) - 1;
  let b = 2 * (Math.exp(sigma3 * sigma2 * rho23) - 1);
  let c = Math.exp(sigma2 ** 2) - 1;
  let qinv2 = DDTarget ** 2;
  let v = -S3 / S2 / K2;
  let a0 = (a * qinv2 - 1) * v ** 2;
  let b0 = (b * qinv2 - 2 + 2 * kappa * Math.exp(-r)) * v;
  let c0 =
    c * qinv2 - kappa ** 2 * Math.exp(-2 * r) + 2 * kappa * Math.exp(-r) - 1;
  let Mstar1 = (-b0 + Math.sqrt(b0 ** 2 - 4 * a0 * c0)) / (2 * a0);
  let Mstar2 = (-b0 - Math.sqrt(b0 ** 2 - 4 * a0 * c0)) / (2 * a0);
  return Math.max(Mstar1, Mstar2);
}

export function calculateAMMTargetSize(
  DDTarget: number,
  CMinimal: number,
  sigma2: number,
  sigma3: number,
  rho23: number,
  S2: number,
  S3: number,
  K2: number,
  L1: number,
  marginCash: number,
  collateralCCY: number
) {
  let M;
  if (collateralCCY === COLLATERAL_CURRENCY_BASE) {
    M = getTargetCollateralM2(K2, S2, L1, sigma2, DDTarget);
  } else if (collateralCCY === COLLATERAL_CURRENCY_QUOTE) {
    M = getTargetCollateralM1(K2, S2, L1, sigma2, DDTarget);
  } else {
    // console.assert(collateralCCY === COLLATERAL_CURRENCY_QUANTO);
    M = getTargetCollateralM3(
      K2,
      S2,
      S3,
      L1,
      sigma2,
      sigma3,
      rho23,
      0,
      DDTarget
    );
  }
  // account for margin cash
  M = M - marginCash;
  // account for min target
  M = Math.max(CMinimal, M);
  return M;
}

export function getDFTargetSize(
  K2pair: number[],
  k2Trader: number,
  r2pair: number[],
  r3pair: number[],
  n: number,
  S2: number,
  S3: number,
  collateralCCY: number
) {
  /*Calculate the target size for the default fund
    K2pair ([number, number]): Conservative AMM K2 for K2<0, and K2>0 respectively
    k2pair ([number, number]): : Conservative trader k2 for k2<0, and k2>0 respectively
    r2pair ([number, number]): Negative extreme return, positive extreme return for S2
    r3pair ([number, number]): Negative extreme return, positive extreme return for S3
    n ([number]): cover-n rule: how many defaulting traders would the AMM cover?
    S2 ([number]): current S2 index
    S3 ([number]): current S3 (quanto) index
    collateralCCY ([int]): COLLATERAL_CURRENCY_QUOTE
    2 for M2 (base), 3 for M3 (quanto) 

    Returns:
    [number]: target size
    */
  K2pair = [Math.abs(K2pair[0]), Math.abs(K2pair[1])];
  k2Trader = Math.abs(k2Trader);
  let loss_down = (K2pair[0] + n * k2Trader) * (1 - Math.exp(r2pair[0]));
  let loss_up = (K2pair[1] + n * k2Trader) * (Math.exp(r2pair[1]) - 1);
  if (collateralCCY === COLLATERAL_CURRENCY_QUOTE) {
    return S2 * Math.max(loss_down, loss_up);
  } else if (collateralCCY === COLLATERAL_CURRENCY_BASE) {
    return Math.max(
      loss_down / Math.exp(r2pair[0]),
      loss_up / Math.exp(r2pair[1])
    );
  } else {
    // console.assert(collateralCCY === COLLATERAL_CURRENCY_QUANTO);
    let m0 = loss_down / Math.exp(r3pair[0]);
    let m1 = loss_up / Math.exp(r3pair[1]);
    return (S2 / S3) * Math.max(m0, m1);
  }
}

export function mul64x64(x: BigNumber, y: BigNumber) {
  return x.mul(y).div(ONE_64x64);
}

export function div64x64(x: BigNumber, y: BigNumber) {
  return x.mul(ONE_64x64).div(y);
}

export function add64x64(x: BigNumber, y: BigNumber) {
  return x.add(y);
}

export function sub64x64(x: BigNumber, y: BigNumber) {
  return x.sub(y);
}

export function abs64x64(x: BigNumber) {
  let r = x.lt(0) ? x.mul(-1) : x;
  return r;
}

export function fractionToABDK64x64(nominator: number, denominator: number) {
  // convert a fraction of to integers to ABDK64x64 bigint-format
  // more accurate than the floating point version.
  if (nominator === 0) {
    return BigNumber.from(0);
  }
  if (denominator === 0) {
    throw new Error("fractionToABDK64x64 denominator must not be zero");
  }
  if (
    nominator - Math.floor(nominator) !== 0 ||
    denominator - Math.floor(denominator)
  ) {
    throw new Error("fractionToABDK64x64 arguments must be integer numbers");
  }
  let x = BigNumber.from(nominator).mul(ONE_64x64);
  let y = x.div(denominator);
  return y;
}

export function ABK64x64ToFloat(x: BigNumber | number) {
  // convert ABK64x64 bigint-format to float
  if (typeof x == "number") {
    return x / 2 ** 29;
  }
  let s = x.lt(0) ? -1 : 1;
  x = x.mul(s);
  let xInt = x.div(ONE_64x64);
  let dec18 = BigNumber.from(10).pow(BigNumber.from(18));
  let xDec = x.sub(xInt.mul(ONE_64x64));
  xDec = xDec.mul(dec18).div(ONE_64x64);
  let k = 18 - xDec.toString().length;
  // console.assert(k >= 0);
  let sPad = "0".repeat(k);
  let NumberStr = xInt.toString() + "." + sPad + xDec.toString();
  return parseFloat(NumberStr) * s;
}

export function fromDec18(x: BigNumber) {
  return x.mul(ONE_64x64).div(DECIMALS);
}

export function toDec18(x: BigNumber) {
  return x.mul(DECIMALS).div(ONE_64x64);
}

export function toDecN(x: BigNumber, decimals: number) {
  return x.mul(BN.from(10).pow(BN.from(decimals))).div(ONE_64x64);
}

/**
 *
 * @param {number} x number (float)
 * @param {number} decimals number of decimals
 * @returns {BigNumber} x as a BigNumber in Dec18 format
 */
export function floatToDecN(x: number, decimals: number): BigNumber {
  // float number to dec 18
  if (x === 0) {
    return BigNumber.from(0);
  }
  let sg = Math.sign(x);
  x = Math.abs(x);
  let strX = x.toFixed(decimals);
  const arrX = strX.split(".");
  let xInt = BigNumber.from(arrX[0]);
  let xDec = BigNumber.from(arrX[1]);
  let xIntBig = xInt.mul(BigNumber.from(10).pow(BigNumber.from(decimals)));
  return xIntBig.add(xDec).mul(sg);
}

/**
 *
 * @param {BigNumber} x BigNumber in Dec-N format
 * @returns {number} x as a float (number)
 */
export function decNToFloat(x: BigNumber, numDec: number) {
  //x: BigNumber in DecN format to float
  const DECIMALS = BigNumber.from(10).pow(BigNumber.from(numDec));
  let s = x.lt(0) ? -1 : 1;
  x = x.mul(s);
  let xInt = x.div(DECIMALS);
  let xDec = x.sub(xInt.mul(DECIMALS));
  let k = numDec - xDec.toString().length;
  let sPad = "0".repeat(k);
  let NumberStr = xInt.toString() + "." + sPad + xDec.toString();
  return parseFloat(NumberStr) * s;
}
