import { POOLS } from 'src/interest-stable-swap-sdk';

import { log, stableSwapSDK } from '../utils.script';

(async () => {
  const pool = await stableSwapSDK.getPool(POOLS.WAL_WWAL.objectId);

  log(pool);
})();
