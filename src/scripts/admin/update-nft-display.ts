import { Transaction } from '@mysten/sui/transactions';
import { SUI_FRAMEWORK_ADDRESS } from '@mysten/sui/utils';

import { OWNED_OBJECTS, TYPES } from '../../blizzard/constants';
import { executeTx, log } from '../utils.script';

(async () => {
  const tx = new Transaction();

  tx.moveCall({
    package: SUI_FRAMEWORK_ADDRESS,
    module: 'display',
    function: 'edit',
    arguments: [
      tx.object(OWNED_OBJECTS.BLIZZARD_STAKE_NFT_DISPLAY),
      tx.pure.string('image_url'),
      tx.pure.string('https://api.winterwalrus.com/nft/{id}.png'),
    ],
    typeArguments: [TYPES.BLIZZARD_STAKE_NFT],
  });

  tx.moveCall({
    package: SUI_FRAMEWORK_ADDRESS,
    module: 'display',
    function: 'update_version',
    arguments: [tx.object(OWNED_OBJECTS.BLIZZARD_STAKE_NFT_DISPLAY)],
    typeArguments: [TYPES.BLIZZARD_STAKE_NFT],
  });

  const result = await executeTx(tx);

  log(result);
})();
