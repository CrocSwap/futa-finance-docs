# Events

FUTA emits immutable transaction-log records for indexing auction and market activity. Indexers should also read account state: not every state transition has a dedicated event.

All event payload integers use Borsh little-endian encoding. Public keys are 32 bytes.

## Auction-program encoding

Auction events use Anchor event encoding:

```text
8-byte event discriminator || Borsh payload
```

The discriminator is the first eight bytes of the event's Anchor hash. It is shown below as decimal bytes in log order.

### AuctionOpened

Discriminator: `[25, 230, 140, 215, 100, 193, 14, 70]`

| Field            | Type     | Meaning                         |
| ---------------- | -------- | ------------------------------- |
| `token_mint`     | `Pubkey` | Newly created supply mint       |
| `ticker`         | `string` | Uppercase ticker                |
| `creator`        | `Pubkey` | Launching wallet                |
| `end_time`       | `i64`    | Auction end as Unix seconds     |
| `start_level`    | `u16`    | Reserve price level             |
| `step_size`      | `u16`    | Valid level spacing             |
| `auction_supply` | `u64`    | Supply-token base units offered |

### AuctionFinalized

Discriminator: `[136, 160, 117, 237, 77, 211, 136, 28]`

| Field                 | Type     | Meaning                                                     |
| --------------------- | -------- | ----------------------------------------------------------- |
| `token_mint`          | `Pubkey` | Auctioned supply mint                                       |
| `clearing_level`      | `u16`    | Final clearing level                                        |
| `clearing_sqrt_price` | `u128`   | Clearing sqrt price in Q64.64                               |
| `total_proceeds`      | `u64`    | Quote base units consumed by settlement before auction fees |
| `protocol_cut`        | `u64`    | Protocol auction fee in quote base units                    |
| `creator_cut`         | `u64`    | Creator auction fee in quote base units                     |

### PermanentReserveEstablished

Discriminator: `[126, 79, 98, 28, 226, 36, 123, 92]`

| Field               | Type     | Meaning                                                  |
| ------------------- | -------- | -------------------------------------------------------- |
| `token_mint`        | `Pubkey` | Auctioned supply mint                                    |
| `reserve_vault`     | `Pubkey` | Token account holding the permanently reserved supply    |
| `reserve_authority` | `Pubkey` | Owner of that vault, derived from the System Program     |
| `reserve_supply`    | `u64`    | Supply-token base units withheld from bidder allocations |

Emitted by the same finalization transaction as `AuctionFinalized`, after it, and only when the withheld amount is positive. The reserve authority is a program-derived address of Solana's System Program, so no signer for it exists and the vault balance can never move.

### TickerRegistered

Discriminator: `[84, 8, 95, 226, 16, 181, 38, 94]`

| Field         | Type       | Meaning                             |
| ------------- | ---------- | ----------------------------------- |
| `ticker`      | `string`   | Registered uppercase ticker         |
| `ticker_hash` | `[u8; 32]` | Keccak-256 hash of the ticker bytes |
| `token_mint`  | `Pubkey`   | Mint assigned to the ticker         |

`TickerRegistered` and `AuctionOpened` are emitted by the same successful launch transaction.

### BidPlaced

Discriminator: `[135, 53, 176, 83, 193, 69, 108, 61]`

| Field         | Type     | Meaning                    |
| ------------- | -------- | -------------------------- |
| `token_mint`  | `Pubkey` | Auctioned mint             |
| `bidder`      | `Pubkey` | Bid owner                  |
| `bid_index`   | `u16`    | Bid identifier             |
| `bid_size`    | `u64`    | Deposited quote base units |
| `limit_level` | `u16`    | Bid limit level            |

This event covers ordinary `place_bid` calls. Increasing or modifying an existing bid does not emit a separate event; indexers should refresh its `BidState` after those transactions.

### BidCancelled

Discriminator: `[175, 52, 76, 11, 201, 1, 205, 65]`

| Field           | Type     | Meaning                   |
| --------------- | -------- | ------------------------- |
| `token_mint`    | `Pubkey` | Auctioned mint            |
| `bidder`        | `Pubkey` | Bid owner                 |
| `bid_index`     | `u16`    | Bid identifier            |
| `refund_amount` | `u64`    | Quote base units returned |

The bid account closes in the same transaction.

### BidClaimed

Discriminator: `[187, 133, 70, 99, 108, 104, 243, 174]`

| Field             | Type     | Meaning                             |
| ----------------- | -------- | ----------------------------------- |
| `token_mint`      | `Pubkey` | Auctioned mint                      |
| `bidder`          | `Pubkey` | Bid owner                           |
| `bid_index`       | `u16`    | Bid identifier                      |
| `tokens_received` | `u64`    | Supply-token base units transferred |
| `quote_refunded`  | `u64`    | Quote base units returned           |

The bid account closes in the same transaction.

## Treasury AMM encoding

Treasury AMM events use:

```text
8-byte ASCII discriminator || Borsh payload
```

Each payload begins with `version: u8`. The current version is `3`. Version 3 reports every price as an unsigned Q64.64 fixed-point value in a `u128`: divide by `2^64` to recover quote-token base units per one whole supply token. Earlier schemas reported `u64` base-unit prices in the same field positions, so decode by version rather than by offset, and do not combine version 3 prices with observations from another schema.

### PoolInitializedEvent

Discriminator: `TAMMINIT`

| Field               | Type     | Meaning                                  |
| ------------------- | -------- | ---------------------------------------- |
| `version`           | `u8`     | Event schema version                     |
| `pool`              | `Pubkey` | Pool address                             |
| `token_mint`        | `Pubkey` | Supply-token mint                        |
| `stable_mint`       | `Pubkey` | Quote-token mint                         |
| `creator`           | `Pubkey` | Recorded market creator                  |
| `initial_price_x64` | `u128`   | Initial active marginal price in Q64.64  |
| `initial_backing`   | `u64`    | Initial backing quote base units         |
| `initial_liquidity` | `u64`    | Initial curve-liquidity quote base units |
| `total_supply`      | `u64`    | Fixed supply-token base units            |
| `circulating`       | `u64`    | Initial circulating base units           |
| `timestamp`         | `i64`    | Unix seconds                             |

The version 3 payload is 185 bytes, so the complete log record is 193 bytes including the discriminator.

### SwapEvent

Discriminator: `TAMMSWAP`

| Field                      | Type     | Meaning                                       |
| -------------------------- | -------- | --------------------------------------------- |
| `version`                  | `u8`     | Event schema version                          |
| `pool`                     | `Pubkey` | Pool address                                  |
| `user`                     | `Pubkey` | Swap signer                                   |
| `direction`                | `u8`     | `0` for sell, `1` for buy                     |
| `amount_in`                | `u64`    | Input base units                              |
| `amount_out`               | `u64`    | Output base units                             |
| `fee`                      | `u64`    | Fee charged in quote base units               |
| `price_before_x64`         | `u128`   | Active marginal price before the swap, Q64.64 |
| `price_after_x64`          | `u128`   | Active marginal price after the swap, Q64.64  |
| `reserve_value_before_x64` | `u128`   | Reserve Value before the swap, Q64.64         |
| `reserve_value_after_x64`  | `u128`   | Reserve Value after the swap, Q64.64          |
| `timestamp`                | `i64`    | Unix seconds                                  |

For a buy, `amount_in` is quote and `amount_out` is the market token. For a sell, `amount_in` is the market token and `amount_out` is quote.

The version 3 payload is 162 bytes, so the complete log record is 170 bytes including the discriminator.

### FeesClaimedEvent

Discriminator: `TAMMFEES`

| Field       | Type     | Meaning                             |
| ----------- | -------- | ----------------------------------- |
| `version`   | `u8`     | Event schema version                |
| `pool`      | `Pubkey` | Pool address                        |
| `recipient` | `Pubkey` | Destination quote-token account     |
| `fee_type`  | `u8`     | `1` for protocol or `2` for creator |
| `amount`    | `u64`    | Quote base units transferred        |
| `timestamp` | `i64`    | Unix seconds                        |

The schema reserves fee type `0` for treasury, but treasury fees are routed into pool accounting and have no claim instruction.

## Indexing rules

- Treat the transaction signature plus event position as the event identity.
- Wait for the finality level required by your application before making records permanent.
- Reject unknown event versions instead of decoding them as the current schema.
- Keep raw amounts as integers. Apply mint decimals only for display.
- Re-read affected accounts after bid increases, bid modifications, auction creator-fee claims, vault closure, and administrative changes because those transitions do not emit dedicated events.

See [Numeric units](numeric-units.md) for amount and price interpretation.
