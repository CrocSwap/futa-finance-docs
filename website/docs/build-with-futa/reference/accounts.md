# Accounts

FUTA uses an auction program for ticker launches and settlement, plus a Treasury AMM program for each market created at finalization.

Auction-program state uses Anchor account encoding unless a section says otherwise. Treasury AMM pool state uses a fixed Borsh layout.

## PDA derivation

The second column identifies which program ID to use for each derivation. Text seeds below are UTF-8 bytes. Public keys are their 32-byte values, hashes are 32 bytes, and `bid_index` is a two-byte little-endian integer.

| Account                     | Derivation program | Seeds                                                        |
| --------------------------- | ------------------ | ------------------------------------------------------------ |
| Protocol config             | Auction            | `"config_v3"`                                                |
| Program data                | Upgradeable Loader | `auction_program_id`                                         |
| Ticker entry                | Auction            | `"ticker_v2"`, `keccak256(ticker_bytes)`                     |
| Auction state               | Auction            | `"auction_v2"`, `token_mint`                                 |
| Bid state                   | Auction            | `"bid_v2"`, `token_mint`, `bidder`, `bid_index`              |
| Auction token vault         | Auction            | `"vault_v2"`, `token_mint`                                   |
| Auction quote vault         | Auction            | `"quote_vault_v2"`, `token_mint`                             |
| Auction vault authority     | Auction            | `"vault_auth_v2"`, `token_mint`                              |
| Level buckets               | Auction            | `"level_buckets_v2"`, `token_mint`                           |
| Global liquidity config     | Auction            | `"liq_config"`                                               |
| Pool liquidity config       | Auction            | `"pool_liq_config"`, `token_mint`                            |
| Pool liquidity state        | Auction            | `"pool_liq_state"`, `token_mint`                             |
| Permanent reserve vault     | Auction            | `"permanent_reserve_vault"`, `token_mint`                    |
| Permanent reserve authority | System Program     | `"futa_permanent_reserve"`, `token_mint`                     |
| Creator fee-right mint      | Auction            | `"creator_fee_mint"`, `token_mint`                           |
| Creator fee right           | Auction            | `"creator_fee_right"`, `fee_mint`                            |
| Launch metadata             | Token Metadata     | `"metadata"`, `metadata_program_id`, `token_mint`            |
| Fee-right metadata          | Token Metadata     | `"metadata"`, `metadata_program_id`, `fee_mint`              |
| Fee-right master edition    | Token Metadata     | `"metadata"`, `metadata_program_id`, `fee_mint`, `"edition"` |
| Market initializer          | Auction            | `"tamm_initializer"`, `token_mint`                           |
| Market token vault          | Auction            | `"tamm_token_vault"`, `token_mint`                           |
| Market stable vault         | Auction            | `"tamm_stable_vault"`, `token_mint`                          |
| Market pool                 | Treasury AMM       | `"pool"`, `token_mint`                                       |
| Market authority            | Treasury AMM       | `"authority"`, `pool`                                        |

Vault addresses are derived with the auction program, while the vault data accounts are owned by the SPL Token program. The two market vaults use the Treasury AMM market-authority PDA as their token authority.

The ProgramData PDA belongs to Solana's BPF Upgradeable Loader rather than the auction program. It is read only during `initialize_protocol` to prove that the initializer is the deployment's upgrade authority.

The permanent reserve authority is the one derivation in this table that uses Solana's System Program as its derivation program. That address has no private key and no program that can sign for it, so the permanent reserve vault's balance is permanently immobile.

## Auction-program accounts

### ProtocolConfig

Global launch and auction configuration.

| Field                       | Type       | Meaning                                                      |
| --------------------------- | ---------- | ------------------------------------------------------------ |
| `authority`                 | `Pubkey`   | Authority allowed to update protocol configuration           |
| `token_supply`              | `u64`      | Total base units minted for each launch                      |
| `auction_supply`            | `u64`      | Base units allocated to the auction                          |
| `token_decimals`            | `u8`       | Decimals for launched mints                                  |
| `protocol_fee`              | `u16`      | Protocol auction fee in parts per million                    |
| `creator_fee`               | `u16`      | Creator auction fee in parts per million                     |
| `auction_duration`          | `u32`      | Auction duration in seconds                                  |
| `auction_step_size`         | `u16`      | Distance between valid bid levels                            |
| `auction_start_step`        | `u16`      | Reserve price level                                          |
| `max_ticker_len`            | `u16`      | Configured maximum ticker length                             |
| `ticker_chain`              | `[u8; 32]` | Rolling hash of registered ticker hashes                     |
| `quote_mint`                | `Pubkey`   | Quote-token mint used by new auctions                        |
| `bump`                      | `u8`       | PDA bump                                                     |
| `metadata_base_uri`         | `[u8; 96]` | Right-padded metadata base URI bytes                         |
| `metadata_base_uri_len`     | `u8`       | Active length of the URI field                               |
| `liq_vault_authority`       | `Pubkey`   | Not read by Treasury AMM finalization                        |
| `default_fee_rate`          | `u16`      | Not read by Treasury AMM finalization                        |
| `default_protocol_fee_rate` | `u16`      | Not read by Treasury AMM finalization                        |
| `default_tick_spacing`      | `u16`      | Not read by Treasury AMM finalization                        |
| `min_ticker_len`            | `u16`      | Configured minimum ticker length; zero is interpreted as one |
| `ticker_limit_active`       | `bool`     | Whether the remaining-launch counter is enforced             |
| `tickers_remaining`         | `u64`      | Launches remaining while the counter is active               |
| `permanent_reserve_version` | `u8`       | Permanent-reserve policy applied to new auctions             |

`token_decimals` is written once by `initialize_protocol` and is immutable afterwards. `permanent_reserve_version` must equal `1` before the protocol accepts launches; version `1` withholds 100 basis points of each auction allocation.

The current SDK `ProtocolConfig` decoder omits the four legacy CLMM fields (`liq_vault_authority`, `default_fee_rate`, `default_protocol_fee_rate`, and `default_tick_spacing`). Decode the account with the packaged Anchor IDL if an integration needs those values.

### TickerEntry

Permanent registration for one FUTA ticker.

| Field            | Type       | Meaning                                   |
| ---------------- | ---------- | ----------------------------------------- |
| `ticker_bytes`   | `[u8; 16]` | Uppercase ASCII ticker, padded with zeros |
| `ticker_len`     | `u8`       | Active ticker length                      |
| `token_mint`     | `Pubkey`   | Mint assigned to the ticker               |
| `is_blacklisted` | `bool`     | Administrative launch block               |
| `bump`           | `u8`       | PDA bump                                  |

### AuctionState

Launch-time configuration, live clearing state, and finalization state for one ticker.

| Field                          | Type       | Meaning                                                                 |
| ------------------------------ | ---------- | ----------------------------------------------------------------------- |
| `token_mint`                   | `Pubkey`   | Auctioned supply-token mint                                             |
| `creator`                      | `Pubkey`   | Launching wallet                                                        |
| `end_time`                     | `i64`      | Closing time as Unix seconds                                            |
| `start_level`                  | `u16`      | Reserve price level                                                     |
| `step_size`                    | `u16`      | Valid level spacing                                                     |
| `auction_supply`               | `u64`      | Supply-token base units offered                                         |
| `protocol_fee`                 | `u16`      | Launch-time protocol fee snapshot in ppm                                |
| `ticker_bytes`                 | `[u8; 16]` | Padded uppercase ticker                                                 |
| `ticker_len`                   | `u8`       | Active ticker length                                                    |
| `clearing_level`               | `u16`      | Current or final clearing level                                         |
| `cum_lifting_bids`             | `u64`      | Quote base units bid strictly above clearing, including the creator bid |
| `clearing_level_bids`          | `u64`      | Finalized snapshot of quote bids at clearing                            |
| `has_refunded`                 | `bool`     | True after finalization completes                                       |
| `quote_mint`                   | `Pubkey`   | Launch-time quote-mint snapshot                                         |
| `registry_page`                | `u16`      | Registry position field                                                 |
| `registry_slot`                | `u16`      | Registry position field                                                 |
| `creator_lifting_bids`         | `u64`      | Creator bid tracked outside ordinary level buckets                      |
| `creator_fee_amount`           | `u64`      | Creator auction fee available after finalization                        |
| `creator_fee_claimed`          | `bool`     | Whether the creator auction fee was claimed                             |
| `creator_fee`                  | `u16`      | Launch-time creator fee snapshot in ppm                                 |
| `creator_fee_snapshot_present` | `bool`     | Confirms that `creator_fee` is an explicit snapshot                     |
| `permanent_reserve_version`    | `u8`       | Launch-time permanent-reserve policy snapshot                           |
| `unsettled_bid_count`          | `u32`      | Open `BidState` accounts remaining under the current policy             |
| `bump`                         | `u8`       | PDA bump                                                                |

`has_refunded` is the finalized-state flag. Its name does not imply that every bid received a refund.

`permanent_reserve_version` and `unsettled_bid_count` replace five formerly reserved bytes. `permanent_reserve_version` is snapshotted at launch, so a later policy change does not alter an open auction. `unsettled_bid_count` starts at one for the creator bid, rises with each new bid, and falls with each pre-finalization cancellation or post-finalization claim; a bid that would overflow it is rejected with `TooManyBids`.

### BidState

One bid, keyed by auction mint, bidder, and caller-selected index.

| Field          | Type     | Meaning                          |
| -------------- | -------- | -------------------------------- |
| `auction_mint` | `Pubkey` | Auctioned mint                   |
| `bidder`       | `Pubkey` | Bid owner                        |
| `bid_index`    | `u16`    | Per-bid identifier               |
| `bid_size`     | `u64`    | Deposited quote-token base units |
| `limit_level`  | `u16`    | Maximum acceptable auction level |
| `bid_time`     | `i64`    | Placement time as Unix seconds   |
| `is_settled`   | `bool`   | Claim or cancellation guard      |
| `bump`         | `u8`     | PDA bump                         |

Bid accounts close when claimed or cancelled. Quote escrow is held in the auction's shared quote vault, not in each bid account. Index `42002` is reserved for the creator bid.

### LiquidityConfig

Global defaults used when finalization creates a Treasury AMM market.

| Field                      | Type        | Meaning                                                      |
| -------------------------- | ----------- | ------------------------------------------------------------ |
| `liquidity_authority`      | `Pubkey`    | Recorded liquidity authority                                 |
| `liquidity_allocation_bps` | `u16`       | Share of net auction reserves requested as trading liquidity |
| `protocol_fee_bps`         | `u16`       | Protocol share of market fees                                |
| `creator_fee_bps`          | `u16`       | Creator share of market fees                                 |
| `bump`                     | `u8`        | PDA bump                                                     |
| `_reserved`                | `[u8; 977]` | Reserved bytes                                               |

### PoolLiquidityConfig

Immutable per-market snapshot of `LiquidityConfig`.

| Field                      | Type        | Meaning                                              |
| -------------------------- | ----------- | ---------------------------------------------------- |
| `token_mint`               | `Pubkey`    | Supply-token mint                                    |
| `liquidity_authority`      | `Pubkey`    | Recorded liquidity authority                         |
| `liquidity_allocation_bps` | `u16`       | Initial reserve share requested as trading liquidity |
| `protocol_fee_bps`         | `u16`       | Protocol share of market fees                        |
| `creator_fee_bps`          | `u16`       | Creator share of market fees                         |
| `bump`                     | `u8`        | PDA bump                                             |
| `_reserved`                | `[u8; 945]` | Reserved bytes                                       |

### PoolLiquidityState

Immutable record of the market created during auction finalization.

| Field                     | Type        | Meaning                                       |
| ------------------------- | ----------- | --------------------------------------------- |
| `token_mint`              | `Pubkey`    | Supply-token mint                             |
| `pool`                    | `Pubkey`    | Treasury AMM pool                             |
| `token_vault`             | `Pubkey`    | Market inventory vault                        |
| `stable_vault`            | `Pubkey`    | Market quote-reserve vault                    |
| `created_at`              | `i64`       | Initialization time as Unix seconds           |
| `clearing_level`          | `u16`       | Auction level used at finalization            |
| `initial_sqrt_price_x64`  | `u128`      | Auction clearing sqrt price in Q64.64         |
| `initial_inventory`       | `u64`       | Initial market inventory base units           |
| `initial_circulating`     | `u64`       | Initial circulating base units                |
| `initial_reserves`        | `u64`       | Initial quote reserves in base units          |
| `bump`                    | `u8`        | PDA bump                                      |
| `fee_right_version`       | `u8`        | Creator fee-right layout this pool requires   |
| `permanent_reserve_vault` | `Pubkey`    | Vault holding the permanently reserved supply |
| `_reserved`               | `[u8; 804]` | Reserved bytes                                |

`fee_right_version` and `permanent_reserve_vault` were carved from the reserved bytes, so the account stays 1,024 bytes and every preceding field keeps its offset. A `fee_right_version` of zero marks a pool finalized before creator fee rights existed; those pools cannot initialize one.

### CreatorFeeRight

Immutable link between one launch and its transferable creator fee-right NFT. It is created by `initialize_creator_fee_right` and is the signing authority for both creator-fee claims.

| Field              | Type        | Meaning                                         |
| ------------------ | ----------- | ----------------------------------------------- |
| `version`          | `u8`        | Account layout and authorization version        |
| `token_mint`       | `Pubkey`    | Supply mint of the associated launch            |
| `fee_mint`         | `Pubkey`    | Canonical one-of-one SPL mint for the fee right |
| `pool`             | `Pubkey`    | Treasury AMM pool created by finalization       |
| `original_creator` | `Pubkey`    | Launch creator and initial NFT recipient        |
| `fee_mint_bump`    | `u8`        | Bump for the fee-right mint PDA                 |
| `bump`             | `u8`        | PDA bump                                        |
| `_reserved`        | `[u8; 117]` | Reserved bytes                                  |

The account is 256 bytes and immutable after initialization. `original_creator` records who received the NFT; it is not the claim authority. Authority follows the token, so the current holder of the one unit of `fee_mint` claims the fees. The fee-right mint has zero decimals and a supply of exactly one, and authenticity comes from the canonical PDA derivations rather than from metadata fields.

### LevelBuckets

`LevelBuckets` is a manually encoded account, not an Anchor account type. It aggregates quote bids by valid auction level.

| Offset | Size | Value                                    |
| -----: | ---: | ---------------------------------------- |
|      0 |    8 | ASCII marker `LvlBktV2`                  |
|      8 |   32 | Auction mint                             |
|     40 |    1 | PDA bump                                 |
|     41 |    1 | Layout version                           |
|     42 |    2 | Allocated page count, little endian      |
|     44 |    2 | One-entry virtual-to-physical page table |
|     46 |    8 | Initialized-slot bitmap                  |
|     54 |  512 | 64 little-endian `u64` bid totals        |

Slot `i` represents:

```text
level = start_level + i × step_size
```

The current layout holds 64 slots. A zero bitmap bit means the slot is absent; an initialized slot may still contain zero.

## Treasury AMM Pool

The pool is a 367-byte Borsh account with the eight-byte ASCII discriminator `ammpool\0`.

| Field                    | Type       | Meaning                                          |
| ------------------------ | ---------- | ------------------------------------------------ |
| `inventory`              | `u64`      | Supply-token base units held by the market       |
| `circulating`            | `u64`      | Supply-token base units outside market inventory |
| `backing`                | `u64`      | Quote base units assigned to Reserve Value       |
| `liquidity`              | `u64`      | Quote base units assigned to curve liquidity     |
| `total_supply`           | `u64`      | Fixed total supply                               |
| `k_low`, `k_high`        | `u64`      | Low and high limbs of the `u128` invariant       |
| `_price_reserved`        | `u64`      | Reserved wire word; not a price                  |
| `treasury_pct`           | `u8`       | Treasury share of market fees                    |
| `protocol_pct`           | `u8`       | Protocol share of market fees                    |
| `creator_pct`            | `u8`       | Creator share of market fees                     |
| `bump`                   | `u8`       | Pool PDA bump                                    |
| `authority_bump`         | `u8`       | Market-authority PDA bump                        |
| `token_decimals`         | `u8`       | Supply-mint decimals                             |
| `stable_decimals`        | `u8`       | Quote-mint decimals                              |
| `token_mint`             | `Pubkey`   | Supply-token mint                                |
| `stable_mint`            | `Pubkey`   | Quote-token mint                                 |
| `token_vault`            | `Pubkey`   | Inventory vault                                  |
| `stable_vault`           | `Pubkey`   | Quote-reserve vault                              |
| `authority`              | `Pubkey`   | PDA controlling both vaults                      |
| `creator`                | `Pubkey`   | Creator fee recipient authority                  |
| `protocol_fee_recipient` | `Pubkey`   | Protocol fee recipient authority                 |
| `protocol_fees_owed`     | `u64`      | Claimable protocol fee base units                |
| `creator_fees_owed`      | `u64`      | Claimable creator fee base units                 |
| `layout_version`         | `u8`       | Pool layout version; currently `1`               |
| `_reserved`              | `[u8; 47]` | Reserved bytes                                   |

`_price_reserved` formerly held a cached `u64` active price. Prices are now always derived from `inventory`, `circulating`, `backing`, `liquidity`, and `token_decimals`, so the word is retained only to keep existing 367-byte pool accounts valid. Do not read a price from it.

Decoders must check `layout_version` alongside the discriminator and reject any value other than `1`; the field takes one byte from the formerly 48-byte reserved block, so the account size is unchanged.

The accounting invariant is:

```text
inventory + circulating = total_supply
```

The stable vault can hold more than `backing + liquidity` because claimable protocol and creator fees remain in the vault until claimed.

See [Numeric units](numeric-units.md) for scales and [Treasury AMM accounting](../concepts/treasury-amm-accounting.md) for state transitions.
