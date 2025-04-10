import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';
import invariant from 'tiny-invariant';
import util from 'util';

import {
  InterestStableSwapAclSDK,
  InterestStableSwapSDK,
  SHARED_OBJECTS,
} from '../interest-stable-swap-sdk';

dotenv.config();

invariant(process.env.KEY, 'Private key missing');

export const keypair = Ed25519Keypair.fromSecretKey(
  Uint8Array.from(Buffer.from(process.env.KEY, 'base64')).slice(1)
);

export const POW_9 = 10n ** 9n;

export const suiClient = new SuiClient({
  url: getFullnodeUrl('mainnet'),
});

export const acl = new InterestStableSwapAclSDK({
  acl: SHARED_OBJECTS.ACL({ mutable: true }),
});

export const stableSwapSDK = new InterestStableSwapSDK();

export const log = (x: unknown) =>
  console.log(util.inspect(x, false, null, true));

export const executeTx = async (tx: Transaction, client = suiClient) => {
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true },
  });

  // return if the tx hasn't succeed
  if (result.effects?.status?.status !== 'success') {
    console.log('\n\nTX failed');
    return;
  }

  console.log('SUCCESS!');

  if (result.effects.created) {
    log(result.effects.created);
  }
};

export const sleep = async (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function removeLeadingZeros(address: string): string {
  return (address as any).replaceAll(/0x0+/g, '0x');
}
