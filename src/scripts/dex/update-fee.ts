import { OWNED_OBJECTS, POOLS } from '../../interest-stable-swap-sdk/constants';
import { acl, executeTx, stableSwapSDK } from '../utils.script';

(async () => {
  const { tx, returnValues: adminWitness } = await acl.signIn({
    admin: OWNED_OBJECTS.ADMIN,
  });

  await stableSwapSDK.updateFees({
    tx,
    pool: POOLS.WAL_WWAL.objectId,
    adminWitness,
  });

  await executeTx(tx);
})();
