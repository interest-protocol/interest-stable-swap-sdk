import { coinWithBalance } from '@mysten/sui/transactions';

import { COIN_TYPES, POOLS } from '../../interest-stable-swap-sdk/constants';
import { executeTx, keypair, stableSwapSDK } from '../utils.script';

(async () => {
  const walCoin = coinWithBalance({
    type: COIN_TYPES.WWAL,
    balance: 1_000_000_000n,
  });

  const { returnValues: lpCoin, tx } = await stableSwapSDK.swap({
    pool: POOLS.WAL_WWAL.objectId,
    coinIn: walCoin,
    coinInType: COIN_TYPES.WWAL,
    coinOutType: COIN_TYPES.WAL,
  });

  tx.transferObjects([lpCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
