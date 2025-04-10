import { getFullnodeUrl } from '@mysten/sui/client';

import { PACKAGES, SHARED_OBJECTS, TYPES } from './constants';
import { SdkConstructorArgs } from './stable-swap.types';

export const getSdkDefaultArgs = (): SdkConstructorArgs => ({
  packages: PACKAGES,
  fullNodeUrl: getFullnodeUrl('mainnet'),
  sharedObjects: SHARED_OBJECTS,
  types: TYPES,
});
