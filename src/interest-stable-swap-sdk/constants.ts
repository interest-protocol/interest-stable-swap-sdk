import { normalizeSuiAddress, normalizeSuiObjectId } from '@mysten/sui/utils';

import { OwnedObjects, Package } from './stable-swap.types';

export enum Modules {
  Pool = 'interest_stable_pool',
  Version = 'allowed_versions',
  Acl = 'acl',
}

export const PACKAGES: Package = {
  STABLE_SWAP_DEX: {
    original: normalizeSuiAddress(
      '0x50052aca3d7b971bd9824e1bb151748d03870adfe3ba06dce384d2a77297c719'
    ),
    latest: normalizeSuiAddress(
      '0x50052aca3d7b971bd9824e1bb151748d03870adfe3ba06dce384d2a77297c719'
    ),
  },
} as const;

export const OWNED_OBJECTS: OwnedObjects = {
  PUBLISHER: normalizeSuiAddress(
    '0xbd998dd45d0a575712f63b1c13c82a2e7152d1dc8d32cf81c838081eae9ebe52'
  ),
  SUPER_ADMIN: normalizeSuiAddress(
    '0x97bd5896cf54f753ff8a684c1f89cff4d7ee4ee9015b022137db038ea07e6580'
  ),
  UPGRADE_CAP: normalizeSuiAddress(
    '0x05e70cfa4b9b8f632efa5bd75cf0c26b222582b104198542c38e8c722ae20de9'
  ),
} as const;

export const SHARED_OBJECTS = {
  ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x608e6b201bc4733bd959b3e19427f3940c3c0a9b81d963ddd81af9a0823c6060'
    ),
    initialSharedVersion: '525079393',
    mutable,
  }),
  ALLOWED_VERSIONS: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x11257b3c039aed97d3c7dc5730dbf3779db15834717711a814f22c943a3ffbdc'
    ),
    initialSharedVersion: '525079393',
    mutable,
  }),
};
