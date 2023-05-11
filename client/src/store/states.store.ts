import { atom } from "jotai";
import { TraderInterface } from "@d8x/perpetuals-sdk";
import { PerpStorage } from "types/IPerpetualManager";

export const chainIdAtom = atom<number | undefined>(undefined);

export const traderAPIAtom = atom<TraderInterface | null>(null);

export const poolsAtom = atom<
  PerpStorage.LiquidityPoolDataStructOutput[] | null
>(null);

export const perpetualsAtom = atom<
  PerpStorage.PerpetualDataStructOutput[] | null
>(null);

export const ammAccountAtom = atom<
  PerpStorage.MarginAccountStructOutput[] | null
>(null);

export const marginTokensAtom = atom<string[] | null>(null);

export const tokenBalancesAtom = atom<string[][] | null>(null);

export const tokenSymbolsAtom = atom<string[] | null>(null);
