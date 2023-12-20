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

export const ammAccountAtom = atom<Map<
  number,
  PerpStorage.MarginAccountStructOutput
> | null>(null);

export const marginTokensAtom = atom<string[] | null>(null);

export const tokenBalancesAtom = atom<string[][] | null>(null);

export const tokenSymbolsAtom = atom<string[] | null>(null);

export const userAddressAtom = atom<string | undefined>(undefined);

export const allServicesAtom = atom<
  { service: string; address: string }[] | null
>(null);

const numAccountsRecordAtom = atom<Record<number, number>>({});

export const numAccountsAtom = atom(
  (get) => {
    return get(numAccountsRecordAtom);
  },
  (_get, set, { id, numAccounts }) => {
    set(numAccountsRecordAtom, (prev) => {
      let updatedNumAccount = { ...prev };
      updatedNumAccount[id] = numAccounts;
      return updatedNumAccount;
    });
  }
);

export const pxS2S3Atom = atom<[number, number][] | null>(null);

export const poolStaticInfosAtom = atom<
  [number[][], string[], string[], string] | null
>(null);
