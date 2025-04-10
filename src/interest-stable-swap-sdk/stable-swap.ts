import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { Modules, NEW_POOL_FN_MAP } from './constants';
import { SDK } from './sdk';
import { NewPoolArgs, SdkConstructorArgs } from './stable-swap.types';

export class InterestStableSwapSDK extends SDK {
  #stableA = 1_500;

  #MAX_A = 1_000_000_000;

  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super(args);
  }

  public async newPool({
    lpTreasuryCap,
    coins,
    initialA = this.#stableA,
    coinTypes,
    tx = new Transaction(),
    adminWitness,
  }: NewPoolArgs) {
    invariant(coinTypes.length >= 3, 'At least 3 coin types are required');

    invariant(
      coinTypes.length - 1 == coins.length,
      'Coin types and coins must match'
    );

    invariant(
      initialA > 0 && initialA <= this.#MAX_A,
      `Initial A must be greater than 0 and less than or equal to ${this.#MAX_A}`
    );

    const coinDecimals = await Promise.all(
      coinTypes.map((coinType) =>
        this.client.getCoinMetadata({ coinType: normalizeStructTag(coinType) })
      )
    );

    invariant(
      coinDecimals.every((x) => !!x),
      'Failed to fetch coin metadata'
    );

    const coinDecimalsPotato = tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: Modules.CoinDecimals,
      function: 'new',
      arguments: [],
    });

    coinDecimals.forEach((decimals, index) => {
      invariant(decimals.id, 'Failed to fetch coin metadata');
      tx.moveCall({
        package: this.packages.STABLE_SWAP_DEX.latest,
        module: Modules.CoinDecimals,
        function: 'add',
        arguments: [coinDecimalsPotato, tx.object(decimals.id)],
        typeArguments: [coinTypes[index]],
      });
    });

    const version = this.getAllowedVersions(tx);

    return {
      returnValues: tx.moveCall({
        package: this.packages.STABLE_SWAP_DEX.latest,
        module: Modules.Pool,
        function: NEW_POOL_FN_MAP[coinTypes.length - 1],
        arguments: [
          tx.object.clock(),
          this.ownedObject(tx, adminWitness),
          ...coins.map((coin) => this.ownedObject(tx, coin)),
          this.ownedObject(tx, lpTreasuryCap),
          coinDecimalsPotato,
          tx.pure.u256(initialA),
          version,
        ],
        typeArguments: coinTypes,
      }),
      tx,
    };
  }
}
