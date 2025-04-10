import {
  ObjectRef,
  Transaction,
  TransactionObjectArgument,
  TransactionResult,
} from '@mysten/sui/transactions';
import { NestedResult } from '@polymedia/suitcase-core';
interface SharedObjectRef {
  objectId: string;
  mutable: boolean;
  initialSharedVersion: number | string;
}

export type OwnedObject =
  | TransactionObjectArgument
  | string
  | ObjectRef
  | NestedResult;

export type SharedObject = string | SharedObjectRef;

export type U64 = string | bigint | number;

export interface MaybeTx {
  tx?: Transaction;
}

export interface PackageValue {
  original: string;
  latest: string;
}

export type Package = Record<
  'STABLE_SWAP_DEX',
  PackageValue & Record<string, string>
>;

export type SharedObjects = Record<
  'ACL' | 'ALLOWED_VERSIONS',
  ({ mutable }: { mutable: boolean }) => SharedObjectRef
>;

export type OwnedObjects = Record<
  'PUBLISHER' | 'SUPER_ADMIN' | 'UPGRADE_CAP' | 'ADMIN',
  string
>;

export interface SignInArgs extends MaybeTx {
  admin: OwnedObject;
}

export interface SdkConstructorArgs {
  fullNodeUrl?: string;
  packages?: Package;
  sharedObjects?: SharedObjects;
}

export interface PoolMetadataValue {
  index: number;
  scalar: number;
}

export interface InterestStablePool {
  objectId: string;
  lpCoinType: string;
  version: string;
  digest: string;
  type: string;
  stateObjectId: string;
  balances: bigint[];
  coins: string[];
  fees: {
    adminFee: bigint;
    deadline: bigint;
    fee: bigint;
    futureFee: bigint;
    futureAdminFee: bigint;
  };
  futureA: number;
  futureATime: number;
  initialA: number;
  initialATime: number;
  metadatas: {
    [key: string]: {
      index: number;
      scalar: number;
    };
  };
}

// === POOL START ===

export interface NewPoolArgs extends MaybeTx {
  lpTreasuryCap: OwnedObject;
  coins: OwnedObject[];
  initialA?: number;
  coinTypes: string[];
  adminWitness: OwnedObject;
}

export interface SwapArgs extends MaybeTx {
  pool: string | InterestStablePool;
  coinIn: OwnedObject;
  coinInType: string;
  coinOutType: string;
  minAmountOut?: U64;
}

export interface AddLiquidityArgs extends MaybeTx {
  pool: string | InterestStablePool;
  coins: OwnedObject[];
  minAmountOut?: U64;
}

export interface RemoveLiquidityArgs extends MaybeTx {
  pool: string | InterestStablePool;
  lpCoin: OwnedObject;
  minAmountOuts?: U64[];
}

export interface RemoveLiquidityOneCoinArgs extends MaybeTx {
  pool: string | InterestStablePool;
  lpCoin: OwnedObject;
  coinOutType: string;
  minAmountOut?: U64;
}

export interface QuoteSwapArgs extends MaybeTx {
  pool: string | InterestStablePool;
  coinInType: string;
  coinOutType: string;
  amountIn: U64;
}

export interface QuoteAddLiquidityArgs extends MaybeTx {
  pool: string | InterestStablePool;
  amountsIn: U64[];
}

export interface QuoteRemoveLiquidityArgs extends MaybeTx {
  pool: string | InterestStablePool;
  lpCoinAmount: U64;
}

export interface QuoteRemoveLiquidityOneCoinArgs extends MaybeTx {
  pool: string | InterestStablePool;
  lpCoinAmount: U64;
  coinOutType: string;
}

// === POOL END ===

// === ACL Types Start ===

export type InterestStableSwapAclArgs = (
  | SdkConstructorArgs
  | null
  | undefined
) & {
  acl: SharedObject;
};

export interface NewAdminArgs extends MaybeTx {
  superAdmin: OwnedObject;
}

export interface RevokeAdminArgs extends MaybeTx {
  superAdmin: OwnedObject;
  admin: string;
}

export interface SignInArgs extends MaybeTx {
  admin: OwnedObject;
}

export interface DestroyAdminArgs extends MaybeTx {
  admin: OwnedObject;
}

export interface DestroySuperAdminArgs extends MaybeTx {
  superAdmin: OwnedObject;
}

export interface StartSuperAdminTransferArgs extends MaybeTx {
  superAdmin: OwnedObject;
  recipient: string;
}

export interface FinishSuperAdminTransferArgs extends MaybeTx {
  superAdmin: OwnedObject;
}

// === ACL Types End ===

// === Update Metadata ===

export interface UpdateMetadataArgs extends MaybeTx {
  value: string;
  adminWitness: TransactionResult;
  pool: SharedObject;
}
