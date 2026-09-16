# SDK

`@futa/sdk` is FUTA's TypeScript client. It is pure TypeScript with no server dependency: account decoders, PDA helpers, instruction builders, query helpers, auction math, and off-chain swap simulation for both market programs.

The SDK is a convenience, not the contract. The account, instruction, event, and error pages on this site remain authoritative, and anything the SDK does can be reproduced directly against the programs.

## What it exports

| Group                     | Contents                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Addresses and PDAs        | `PROGRAM_ID`, `CLMM_PROGRAM_ID`, `TAMM_PROGRAM_ID`, `TOKEN_METADATA_PROGRAM_ID`, `BPF_LOADER_UPGRADEABLE_PROGRAM_ID`, the three seed maps, and PDA helpers for auction, metadata, program-signer, CLMM, and Treasury AMM accounts                                                                                         |
| Decoders and candle data  | Auction-account decoders; `decodeLevelBucket` and `decodeLevelBuckets`; Treasury AMM, CLMM, price-history, creator-fee-right, and pool-liquidity decoders; `getRecentCandles`, `normalizeCandles`, `sumVolume24h`, `buildTailFilledPoints`, `downsampleSeries`, and `summarizePoolCandles`                                |
| Queries                   | Full and prefix-only auction scans; open-auction, ticker, bid, level-bucket, and CLMM pool/position scans; contextual user bids; auction lookup by ticker or mint; level-bucket availability; quote decimals; open-bid count/index helper; and ticker validation                                                          |
| Auction math              | Fixed-point primitives, price and auction-cap math, exact bid-impact quoting, proceeds and clearing-share calculations, reserve-aware settlement projections, unit conversion, and auction-geometry validation                                                                                                            |
| CLMM simulation           | `simulateExactInput`, `simulateExactOutput`, tick/price conversion, and price-impact helpers                                                                                                                                                                                                                              |
| Treasury AMM quoting      | Buy and sell exact-input and exact-output quotes, hinted-buy quoting, output-hint and price helpers, fee calculation, decimal scaling, saturation detection, and Treasury AMM constants                                                                                                                                   |
| Treasury AMM event decode | `decodeTammSwapEvent`, `parseTammSwapLogs`, `parseActiveTammSwapLogs`, event-version checks, and the discriminator and length constants                                                                                                                                                                                   |
| Protocol/layout helpers   | Reserve-policy decoding and constants, atomic token serialization, auction layout limits, and the finalization compute-unit constant                                                                                                                                                                                      |
| Instruction builders      | Auction initialization/configuration; launch, place, increase, modify, cancel, finalize, claim, fee-right initialization, combined creator-fee claim, and vault closure; `buildSwap`, `buildSetCandleInterval`, and `buildCollectCreatorFees` for CLMM; and `buildTammSwap` plus `buildTammSwapWithHint` for Treasury AMM |

The auction participant builders accept optional `user`, `programSigner`, and, where account creation can occur, `payer` fields. Their defaults construct direct-wallet instructions: `user` and `payer` fall back to the signing wallet, and `programSigner` falls back to the program-ID sentinel that encodes an omitted optional account. See [Signers and payers](instructions.md#signers-and-payers).

## Read auction state

```ts
import { Connection } from '@solana/web3.js';
import { getAllAuctions, computeDisplayLevels } from '@futa/sdk';

const connection = new Connection(rpcUrl);
const auctions = await getAllAuctions(connection);

for (const { pubkey, account } of auctions) {
    const levels = computeDisplayLevels(
        account.startLevel,
        account.stepSize,
        account.auctionSupply,
    );
    console.log(pubkey.toBase58(), account.clearingLevel, levels.length);
}
```

## Place a bid

```ts
import { getNextBidIndex, buildPlaceBid } from '@futa/sdk';

const bidIndex = await getNextBidIndex(connection, bidder, mint);
const ix = buildPlaceBid({
    bidder,
    mint,
    bidIndex,
    bidQuoteAmount: 1_000_000n, // quote base units
    limitLevel: 3600, // valid mainnet on-chain level, not a display level
    bidderQuoteAccount,
    quoteMint,
});
```

`getNextBidIndex` returns the number of currently open bid accounts. That count
is an unused index only while surviving indices are contiguous from zero.
Because cancellation closes the bid account, cancelling a lower index can make
the count collide with a higher surviving index. In that state, query the
wallet's surviving bids and choose an unused u16 index, or handle the collision
and retry.

## Launch a ticker

`buildLaunchAuction` returns the new mint's keypair alongside the instruction. That keypair must co-sign the transaction:

```ts
import { buildLaunchAuction } from '@futa/sdk';

const { ix, mintKeypair } = buildLaunchAuction({
    creator,
    ticker: 'MYTOKEN',
    bidQuoteAmount: 5_000_000n,
    creatorQuoteAccount,
    quoteMint,
});

const tx = new Transaction().add(ix);
tx.partialSign(mintKeypair);
```

## Levels: on-chain and display

The SDK distinguishes the on-chain level from the 1-indexed level a UI shows. Display level 1 is the auction's `start_level`, and each later display level adds one `step_size`:

```ts
import { displayLevelToOnChain, onChainLevelToDisplay } from '@futa/sdk';

displayLevelToOnChain(5, 4096, 64); // 4352
onChainLevelToDisplay(4352, 4096, 64); // 5
```

Validate a level before building an instruction. `validateAuctionLimitLevel` checks a raw on-chain level and `validateAuctionDisplayLevel` checks a UI level; both enforce the `u16` range, step alignment, the 64-slot bucket capacity, the level-8128 price ceiling, and the above-clearing rule in one place.

The range helpers fail closed for relatively aligned geometry such as `start_level` 4097 with a step of 8. Configuration can express it, but the current place and modify instructions require `start_level % step_size == 0`, so the SDK declines rather than producing levels the program would reject.

## Units

Every amount the SDK accepts and returns is in base units, as `bigint`. It applies no decimal formatting. See [Numeric units](numeric-units.md) for the scales, and do the decimal conversion at your own display boundary.

`projectBidSettlement` returns deterministic minimum token and quote-refund amounts. Its `conditionalFinalClaimTokenSweep` and `conditionalFinalClaimQuoteSweep` fields indicate that the bid could also be the final unsettled claim. The exact sweep is not statically quotable because it depends on live auction-vault balances, creator-fee state, and claim order.

See [Program IDs](program-ids.md) for the addresses the SDK carries and [Instructions](instructions.md) for what each builder produces.
