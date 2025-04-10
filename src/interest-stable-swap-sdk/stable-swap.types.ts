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

// === POOL START ===

export interface NewPoolArgs extends MaybeTx {
  lpTreasuryCap: OwnedObject;
  coins: OwnedObject[];
  initialA?: number;
  coinTypes: string[];
  adminWitness: OwnedObject;
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
