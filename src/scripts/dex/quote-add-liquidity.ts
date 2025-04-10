import { POOLS } from 'src/interest-stable-swap-sdk';

import { log, stableSwapSDK } from '../utils.script';

(async () => {
  const result = await stableSwapSDK.quoteAddLiquidity({
    pool: POOLS.WAL_WWAL.objectId,
    amountsIn: [1_000_000_000n, 1_000_000_000n],
  });

  log(result);
})();
