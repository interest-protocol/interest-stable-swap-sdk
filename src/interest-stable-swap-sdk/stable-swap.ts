import { SDK } from './sdk';
import { SdkConstructorArgs } from './stable-swap.types';

export class InterestStableSwapSDK extends SDK {
  constructor(args: SdkConstructorArgs | undefined | null = null) {
    super(args);
  }
}
