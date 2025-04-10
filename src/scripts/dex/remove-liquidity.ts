import { coinWithBalance } from '@mysten/sui/transactions';

import { COIN_TYPES, POOLS } from '../../interest-stable-swap-sdk/constants';
import { executeTx, keypair, stableSwapSDK } from '../utils.script';

(async () => {
  const lpCoin = coinWithBalance({
    type: COIN_TYPES.WAL_WWAL,
    balance: 1_000_000_000n,
  });

  const pool = await stableSwapSDK.getPool(POOLS.WAL_WWAL.objectId);

  const { returnValues: coins, tx } = await stableSwapSDK.removeLiquidity({
    pool,
    lpCoin,
  });

  tx.transferObjects(
    pool.coins.map((_, i) => coins[i]),
    keypair.toSuiAddress()
  );

  await executeTx(tx);
})();
