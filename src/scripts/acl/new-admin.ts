import { OWNED_OBJECTS } from '../../interest-stable-swap-sdk';
import { acl, executeTx, keypair } from '../utils.script';

const recipient = keypair.toSuiAddress();

(async () => {
  const { tx, returnValues } = await acl.newAdmin({
    superAdmin: OWNED_OBJECTS.SUPER_ADMIN,
  });

  tx.transferObjects([returnValues], recipient);

  await executeTx(tx);
})();
