# Instructions

FUTA's on-chain instruction surface spans two programs:

- the auction program manages configuration, ticker launches, bids, settlement, and auction-fee claims;
- the Treasury AMM program manages swaps and market-fee claims.

Names in this page are semantic names. Auction instructions use Anchor's eight-byte instruction discriminators. Treasury AMM instructions use a one-byte Borsh enum tag followed by the listed arguments.

## Auction instructions

### Participant and creator operations

| Instruction          | Arguments                                               | Signer                                              | Effect                                                                                                  |
| -------------------- | ------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `launch_auction`     | `ticker: string`, `bid_amount: u64`                     | Creator; a separate payer may fund account creation | Registers the ticker, creates and mints the fixed supply, opens the auction, and places the creator bid |
| `place_bid`          | `bid_index: u16`, `bid_amount: u64`, `limit_level: u16` | Bidder; a separate payer may fund the bid account   | Escrows quote tokens and creates a new bid                                                              |
| `increase_bid`       | `delta_amount: u64`                                     | Bidder                                              | Adds quote tokens to an existing bid without changing its limit                                         |
| `modify_bid`         | `new_level: u16`, `delta_amount: u64`                   | Bidder; a separate payer may fund bucket growth     | Moves an existing bid to another valid level and optionally adds quote tokens                           |
| `cancel_bid`         | None                                                    | Bidder                                              | Fully refunds and closes a bid whose limit is below the live clearing level                             |
| `claim_bid`          | None                                                    | Bidder                                              | Transfers the finalized token allocation and quote refund, then closes the bid                          |
| `claim_creator_fees` | None                                                    | Fee-right NFT holder                                | Transfers the launch's unclaimed auction creator fee and its accrued market creator fees together       |

`place_bid`, `increase_bid`, and `modify_bid` require an active auction. New and modified limits must be step-aligned and strictly above the live clearing level. `modify_bid` can move a limit either upward or downward as long as the new level remains valid.

`cancel_bid` is governed by price, not by the auction clock: the bid must already be priced out. `claim_bid` requires both auction end and completed finalization.

`claim_creator_fees` is authorized by the launch's creator fee-right NFT, not by the launch creator's address. The signer must hold the one unit of the canonical fee-right mint, and the instruction claims the auction creator fee and the Treasury AMM creator fees in one transaction by invoking the market's creator-fee claim through the `CreatorFeeRight` PDA. The fee right is a transferable SPL NFT, so this authority moves with the token.

### Signers and payers

Participant instructions separate the signing account from the account whose state changes. `signer_or_session` signs the transaction and `user` is the wallet the launch, bid, or claim belongs to. For a direct wallet call the two are the same public key; the program rejects a mismatch with `InvalidSessionUser`.

`program_signer` is an optional account that direct wallet calls omit. Anchor encodes an omitted optional account as the auction program's own ID in that account slot, which is what the SDK builders pass by default.

Rent payment is a separate role where the account list exposes `payer`: launch and bid placement always create accounts, and bid modification may need to grow the level-bucket account. `payer` defaults to the signing wallet.

The `signer_or_session` account name and the `InvalidSessionUser` and `SessionRequiresProgramSigner` error names are fixed by the deployed program and are retained from an earlier interface. Build clients against the direct wallet contract described above.

### Permissionless lifecycle operations

| Instruction                    | Arguments | Signer         | Effect                                                                                                                              |
| ------------------------------ | --------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `finalize_auction`             | None      | Any fee payer  | Settles proceeds, snapshots clearing bids, creates the Treasury AMM market, revokes mint authority, and marks the auction finalized |
| `close_vault`                  | None      | Any receiver   | Closes empty auction token and quote vaults and sends their recovered rent to the signer                                            |
| `initialize_creator_fee_right` | None      | Any rent payer | Creates the launch's one-of-one creator fee-right NFT and mints it to the original creator                                          |

Finalization requires the auction clock to have ended, a nonzero amount of net quote reserves, and valid liquidity configuration. It can run only once. Vault closure requires both auction vault balances to be zero.

`initialize_creator_fee_right` is a separate one-time transaction after finalization. The payer never selects the recipient: the NFT is always minted to the address recorded as the auction creator. It requires `PoolLiquidityState.fee_right_version` to equal the version this program supports, so launches finalized by earlier program versions are not eligible. Until it runs, `claim_creator_fees` has no valid authority.

### Protocol configuration

These instructions require the protocol authority, except for the one-time initializer. `initialize_protocol` verifies the canonical upgradeable-loader `ProgramData` account and requires the deployed program's current upgrade authority to sign; that signer becomes the initial protocol authority.

| Instruction             | Arguments                                                                                                                                                                                       | Effect                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `initialize_protocol`   | `token_decimals: u8`                                                                                                                                                                            | Creates the global protocol config                                |
| `set_auction_params`    | `start_step: u16`, `step_size: u16`, `auction_duration: u32`, `token_supply: u64`, `auction_supply: u64`, `protocol_fee: u16`, `creator_fee: u16`, `max_ticker_len: u16`, `min_ticker_len: u16` | Updates defaults for future launches                              |
| `set_quote_mint`        | None; quote mint is an account                                                                                                                                                                  | Sets the quote-token mint used by future launches                 |
| `set_metadata_uri`      | `uri: string`                                                                                                                                                                                   | Sets the token metadata base URI                                  |
| `set_ticker_limit`      | `active: bool`, `remaining: u64`                                                                                                                                                                | Enables, disables, or resets the launch counter                   |
| `set_blacklist`         | `ticker_hash: [u8; 32]`, `blacklisted: bool`                                                                                                                                                    | Changes a ticker entry's blacklist flag                           |
| `set_liquidity_config`  | `liquidity_authority: Pubkey`, `liquidity_allocation_bps: u16`, `protocol_fee_bps: u16`, `creator_fee_bps: u16`                                                                                 | Sets Treasury AMM defaults for future markets                     |
| `set_clmm_params`       | `liq_vault_authority: Pubkey`, `default_fee_rate: u16`, `default_protocol_fee_rate: u16`, `default_tick_spacing: u16`                                                                           | Sets the CLMM fields that Treasury AMM finalization does not read |
| `set_reserve_policy_v1` | None                                                                                                                                                                                            | Upgrades a pre-policy protocol config to reserve policy version 1 |

`token_decimals` is accepted only by `initialize_protocol` and is immutable afterwards, so every mint the protocol creates shares one precision. `initialize_protocol` installs reserve policy version `1` on a fresh config. `set_reserve_policy_v1` is the migration path for a config created before that policy existed. A config with an unset or unsupported reserve policy does not count as configured, and launch-related configuration or `launch_auction` fails closed.

Configuration changes apply to future launches or markets. Each auction snapshots its fee rates, quote mint, and permanent-reserve policy version, while each market snapshots its liquidity allocation and fee-recipient shares. The Treasury AMM swap fee is a fixed protocol constant.

The current SDK does not provide a builder for `set_clmm_params`. Build that authority-only instruction from the packaged Anchor IDL if you need to maintain the unrelated CLMM configuration.

### Testnet-only maintenance instructions

A build compiled with the auction program's `testnet` feature exposes ten additional instructions for staging setup and destructive fixture cleanup:

| Instruction           | Purpose                                                      |
| --------------------- | ------------------------------------------------------------ |
| `reset_ticker`        | Close a ticker registration                                  |
| `delete_auction`      | Close an auction-state account                               |
| `force_close_auction` | Set an auction's end time to zero                            |
| `set_clearing_level`  | Replace the stored clearing level                            |
| `set_cum_bids`        | Replace cumulative lifting demand                            |
| `phantom_bid`         | Create demand without transferring quote tokens              |
| `credit_vault`        | Transfer caller-owned tokens into an arbitrary token account |
| `drain_vault`         | Transfer tokens out of an auction-authority-controlled vault |
| `delete_bid`          | Close a bid and decrement unsettled-bid accounting           |
| `delete_level`        | Close the manual level-buckets account                       |

These instructions are intentionally absent from production builds and are not protocol participant APIs. Several are permissionless to simplify isolated staging resets and can invalidate economic state. Integrators must identify the deployed binary and cluster rather than assuming a same-address test build has production guarantees.

## Treasury AMM instructions

### Tags and arguments

| Tag | Instruction              | Arguments                                                                                                                                       | Effect                                                       |
| --: | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
|   0 | `InitializePool`         | `liquidity_allocation_bps: u16`, `treasury_pct: u8`, `protocol_pct: u8`, `creator_pct: u8`, `creator: Pubkey`, `protocol_fee_recipient: Pubkey` | Disabled. Always fails with `LegacyInitializerDisabled`      |
|   1 | `Swap`                   | `amount_in: u64`, `minimum_amount_out: u64`, `deadline: i64`                                                                                    | Detects buy or sell from the source-account mint             |
|   2 | `Buy`                    | `stables_in: u64`, `min_tokens_out: u64`, `deadline: i64`                                                                                       | Executes an explicit quote-to-token swap                     |
|   3 | `Sell`                   | `tokens_in: u64`, `min_stables_out: u64`, `deadline: i64`                                                                                       | Executes an explicit token-to-quote swap                     |
|   4 | `GetAmountOut`           | `amount_in: u64`, `is_buy: bool`                                                                                                                | Logs a read-only output quote                                |
|   5 | `GetReserves`            | None                                                                                                                                            | Logs vault reserves, the three Q64.64 prices, and `K`        |
|   6 | `ClaimProtocolFees`      | None                                                                                                                                            | Transfers the pool's accrued protocol fees                   |
|   7 | `ClaimCreatorFees`       | None                                                                                                                                            | Transfers the pool's accrued creator fees                    |
|   8 | `SwapWithHint`           | `amount_in: u64`, `minimum_amount_out: u64`, `deadline: i64`, `amount_out_hint: u64`                                                            | Executes the unified swap path with an off-chain output hint |
|   9 | `InitializePoolFromFuta` | `liquidity_allocation_bps: u16`, `treasury_pct: u8`, `protocol_pct: u8`, `creator_pct: u8`, `creator: Pubkey`, `protocol_fee_recipient: Pubkey` | Creates immutable pool state from funded vault balances      |

Tag 0 is retained only so the later tags keep their numbering. Pools are created exclusively by tag 9, `InitializePoolFromFuta`, which auction finalization invokes after the mint authority is removed and both vaults are funded. It requires the per-mint FUTA initializer PDA, derived as `["tamm_initializer", token_mint]` under the auction program, to sign; a caller that cannot produce that signature receives `UnauthorizedInitializer`. Pool configuration is immutable after creation.

`InitializePoolFromFuta` takes eleven accounts:

| Index | Account                       | Access           |
| ----: | ----------------------------- | ---------------- |
|     0 | Pool PDA                      | Writable         |
|     1 | Market authority PDA          | Read-only        |
|     2 | Token mint                    | Read-only        |
|     3 | Stable mint                   | Read-only        |
|     4 | Token vault                   | Writable         |
|     5 | Stable vault                  | Writable         |
|     6 | Payer                         | Writable, signer |
|     7 | Per-mint FUTA initializer PDA | Signer           |
|     8 | System program                | Read-only        |
|     9 | SPL Token program             | Read-only        |
|    10 | Rent sysvar                   | Read-only        |

`SwapWithHint` verifies buy hints against the invariant boundary. Sell hints are accepted for a symmetric interface; sell execution still derives the result on-chain.

### Swap account order

`Swap` and `SwapWithHint` use this account order:

| Index | Account                        | Access    |
| ----: | ------------------------------ | --------- |
|     0 | Pool                           | Writable  |
|     1 | Market authority PDA           | Read-only |
|     2 | Token vault                    | Writable  |
|     3 | Stable vault                   | Writable  |
|     4 | User source token account      | Writable  |
|     5 | User destination token account | Writable  |
|     6 | User                           | Signer    |
|     7 | SPL Token program              | Read-only |
|     8 | Clock sysvar                   | Read-only |

For a buy, the source account's mint is the stable mint and the destination account's mint is the market token. For a sell, those roles reverse. `Buy` and `Sell` use the same nine accounts, but indices 4 and 5 are always user token account then user stable account.

### Slippage and deadlines

The minimum-output argument is enforced after the on-chain quote is computed. A transaction fails when the computed output is below that minimum.

A positive deadline is a Unix timestamp in seconds. The transaction fails when the current time is later than the deadline. A deadline of zero disables the deadline check.

### Fee claims

Both claim instructions use:

1. writable pool;
2. market authority PDA;
3. writable stable vault;
4. writable recipient token account;
5. authorized recipient signer;
6. SPL Token program.

`ClaimProtocolFees` requires the pool's recorded protocol fee recipient to sign. `ClaimCreatorFees` requires the launch's canonical FUTA `CreatorFeeRight` PDA to sign, so in practice it is reached through the auction program's `claim_creator_fees`, which signs for that PDA on behalf of whoever holds the fee-right NFT. Each instruction transfers the full corresponding accrued balance and resets it to zero.

See [Accounts](accounts.md) for state and PDA seeds, [Events](events.md) for emitted records, and [Errors](errors.md) for failures.
