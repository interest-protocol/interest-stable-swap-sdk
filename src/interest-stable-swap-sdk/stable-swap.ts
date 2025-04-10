import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag, normalizeSuiObjectId } from '@mysten/sui/utils';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import invariant from 'tiny-invariant';

import {
  ADD_LIQUIDITY_FN_MAP,
  Modules,
  NEW_POOL_FN_MAP,
  REMOVE_LIQUIDITY_FN_MAP,
} from './constants';
import { SDK } from './sdk';
import {
  AddLiquidityArgs,
  InterestStablePool,
  NewPoolArgs,
  QuoteAddLiquidityArgs,
  QuoteRemoveLiquidityArgs,
  QuoteRemoveLiquidityOneCoinArgs,
  QuoteSwapArgs,
  RemoveLiquidityArgs,
  RemoveLiquidityOneCoinArgs,
  SdkConstructorArgs,
  SwapArgs,
} from './stable-swap.types';
import { parsePoolObject, parseStateObject } from './utils';

export class InterestStableSwapSDK extends SDK {
  #stableA = 1_500;

  #MAX_A = 1_000_000_000;

  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super(args);
  }

  public async getPool(poolId: string): Promise<InterestStablePool> {
    const poolObj = await this.client.getObject({
      id: normalizeSuiObjectId(poolId),
      options: {
        showContent: true,
        showType: true,
      },
    });

    const pool = parsePoolObject(poolObj);

    const state = await this.client.getObject({
      id: normalizeSuiObjectId(pool.stateObjectId),
      options: {
        showContent: true,
      },
    });

    const stateObj = parseStateObject(state);

    return {
      ...pool,
      ...stateObj,
    };
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

  public async swap({
    pool,
    coinIn,
    coinInType,
    coinOutType,
    minAmountOut = 0n,
    tx = new Transaction(),
  }: SwapArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    invariant(
      pool.coins.includes(normalizeStructTag(coinInType)),
      'Coin in type not found'
    );
    invariant(
      pool.coins.includes(normalizeStructTag(coinOutType)),
      'Coin out type not found'
    );
    invariant(
      coinOutType !== coinInType,
      'Coin in and coin out type cannot be the same'
    );

    const version = this.getAllowedVersions(tx);

    return {
      returnValues: tx.moveCall({
        package: this.packages.STABLE_SWAP_DEX.latest,
        module: Modules.Pool,
        function: 'swap',
        arguments: [
          tx.object(pool.objectId),
          tx.object.clock(),
          this.ownedObject(tx, coinIn),
          tx.pure.u64(minAmountOut),
          version,
        ],
        typeArguments: [coinInType, coinOutType, pool.lpCoinType],
      }),
      tx,
    };
  }

  public async addLiquidity({
    pool,
    coins,
    minAmountOut = 0n,
    tx = new Transaction(),
  }: AddLiquidityArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    invariant(
      pool.coins.length == coins.length,
      'Coin types and coins must match'
    );

    const version = this.getAllowedVersions(tx);

    return {
      returnValues: tx.moveCall({
        package: this.packages.STABLE_SWAP_DEX.latest,
        module: Modules.Pool,
        function: ADD_LIQUIDITY_FN_MAP[pool.coins.length],
        arguments: [
          tx.object(pool.objectId),
          tx.object.clock(),
          ...coins.map((coin) => this.ownedObject(tx, coin)),
          tx.pure.u64(minAmountOut),
          version,
        ],
        typeArguments: [...pool.coins, pool.lpCoinType],
      }),
      tx,
    };
  }

  public async removeLiquidity({
    pool,
    lpCoin,
    minAmountOuts = [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
    tx = new Transaction(),
  }: RemoveLiquidityArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    invariant(
      minAmountOuts.length >= pool.coins.length,
      'Min amount outs must be greater than or equal to the number of coins'
    );

    const version = this.getAllowedVersions(tx);

    return {
      returnValues: tx.moveCall({
        package: this.packages.STABLE_SWAP_DEX.latest,
        module: Modules.Pool,
        function: REMOVE_LIQUIDITY_FN_MAP[pool.coins.length],
        arguments: [
          tx.object(pool.objectId),
          tx.object.clock(),
          this.ownedObject(tx, lpCoin),
          tx.pure.vector('u64', minAmountOuts),
          version,
        ],
        typeArguments: [...pool.coins, pool.lpCoinType],
      }),
      tx,
    };
  }

  public async removeLiquidityOneCoin({
    pool,
    lpCoin,
    coinOutType,
    minAmountOut = 0n,
    tx = new Transaction(),
  }: RemoveLiquidityOneCoinArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    invariant(
      pool.coins.includes(normalizeStructTag(coinOutType)),
      'Coin out type not found'
    );

    const version = this.getAllowedVersions(tx);

    return {
      returnValues: tx.moveCall({
        package: this.packages.STABLE_SWAP_DEX.latest,
        module: Modules.Pool,
        function: 'remove_liquidity_one_coin',
        arguments: [
          tx.object(pool.objectId),
          tx.object.clock(),
          this.ownedObject(tx, lpCoin),
          tx.pure.u64(minAmountOut),
          version,
        ],
        typeArguments: [coinOutType, pool.lpCoinType],
      }),
      tx,
    };
  }

  public async quoteSwap({
    pool,
    coinInType,
    coinOutType,
    amountIn,
    tx = new Transaction(),
  }: QuoteSwapArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: Modules.Pool,
      function: 'quote_swap',
      arguments: [
        tx.object(pool.objectId),
        tx.object.clock(),
        tx.pure.u64(amountIn),
      ],
      typeArguments: [coinInType, coinOutType, pool.lpCoinType],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.U64, bcs.U64],
    ]);

    invariant(
      typeof result[0][0] === 'string',
      'Invalid result: no quote found'
    );

    return {
      amountOut: BigInt(result[0][0]),
      fee: BigInt(result[0][1]),
    };
  }

  public async quoteAddLiquidity({
    pool,
    amountsIn = [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
    tx = new Transaction(),
  }: QuoteAddLiquidityArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    invariant(
      amountsIn.length >= pool.coins.length,
      'Amounts in must be greater than or equal to the number of coins'
    );

    tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: Modules.Pool,
      function: 'quote_add_liquidity',
      arguments: [
        tx.object(pool.objectId),
        tx.object.clock(),
        tx.pure.vector('u64', amountsIn),
      ],
      typeArguments: [pool.lpCoinType],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.U64],
    ]);

    invariant(
      typeof result[0][0] === 'string',
      'Invalid result: no quote found'
    );

    return BigInt(result[0][0]);
  }

  public async quoteRemoveLiquidity({
    pool,
    lpCoinAmount,
    tx = new Transaction(),
  }: QuoteRemoveLiquidityArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: Modules.Pool,
      function: 'quote_remove_liquidity',
      arguments: [tx.object(pool.objectId), tx.pure.u64(lpCoinAmount)],
      typeArguments: [pool.lpCoinType],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.vector(bcs.U64)],
    ]);

    invariant(
      typeof result[0][0][0] === 'string',
      'Invalid result: no quote found'
    );

    return result[0][0].map((x: string) => BigInt(x));
  }

  public async quoteRemoveLiquidityOneCoin({
    pool,
    lpCoinAmount,
    coinOutType,
    tx = new Transaction(),
  }: QuoteRemoveLiquidityOneCoinArgs) {
    if (typeof pool === 'string') {
      pool = await this.getPool(pool);
    }

    tx.moveCall({
      package: this.packages.STABLE_SWAP_DEX.latest,
      module: Modules.Pool,
      function: 'quote_remove_liquidity_one_coin',
      arguments: [
        tx.object(pool.objectId),
        tx.object.clock(),
        tx.pure.u64(lpCoinAmount),
      ],
      typeArguments: [coinOutType, pool.lpCoinType],
    });

    const result = await devInspectAndGetReturnValues(this.client, tx, [
      [bcs.U64, bcs.U64],
    ]);

    invariant(
      typeof result[0][0] === 'string',
      'Invalid result: no quote found'
    );

    return {
      amountOut: BigInt(result[0][0]),
      fee: BigInt(result[0][1]),
    };
  }
}
