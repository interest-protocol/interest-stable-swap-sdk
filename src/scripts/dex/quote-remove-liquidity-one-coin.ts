import { COIN_TYPES, POOLS } from 'src/interest-stable-swap-sdk';

import { log, stableSwapSDK } from '../utils.script';

(async () => {
  const result = await stableSwapSDK.quoteRemoveLiquidityOneCoin({
    pool: POOLS.WAL_WWAL.objectId,
    lpCoinAmount: 1_000_000_000n,
    coinOutType: COIN_TYPES.WWAL,
  });

  log(result);
})();
