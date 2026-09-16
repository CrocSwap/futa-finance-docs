# Numeric units

Keep protocol values as integers through decoding, quoting, transaction construction, and event storage. Apply decimal formatting only at the display boundary.

## Serialization

| Type                              | Encoding                    |
| --------------------------------- | --------------------------- |
| `u8`, `u16`, `u32`, `u64`, `u128` | Unsigned little endian      |
| `i64`                             | Signed little endian        |
| `bool`                            | One byte: zero or one       |
| `Pubkey`                          | 32 bytes                    |
| `string`                          | Borsh length-prefixed UTF-8 |
| `[u8; N]`                         | Exactly `N` bytes           |

JavaScript and TypeScript integrations should represent `u64` and `u128` values with `bigint`. A JavaScript `number` cannot exactly represent the full range.

## Token amounts

All `u64` token amounts are mint base units:

```text
display amount = base units / 10^mint_decimals
```

Use the supply mint's decimals for launched tokens and the quote mint's decimals for bid, reserve, output, and fee amounts. Do not assume that both mints use the same decimals.

Examples of quote-denominated fields include `bid_size`, `cum_lifting_bids`, `backing`, `liquidity`, `protocol_fees_owed`, and `creator_fees_owed`.

## Auction fees: parts per million

Auction `protocol_fee` and `creator_fee` values are parts per million:

```text
fee = floor(gross proceeds × fee_ppm / 1,000,000)
```

The two fees are calculated independently from gross proceeds.

## Market fees: fixed rate and recipient percentages

The Treasury AMM swap fee is a protocol constant of 100 basis points:

```text
10,000 bps = 100%
100 bps = 1%
```

The fee is calculated in quote-token base units:

```text
fee = ceil(gross quote amount × 100 / 10,000)
```

For buys, gross quote amount is the total quote input. For sells, it is the quote output before the fee deduction. The fee rounds up to the nearest quote-token base unit.

Global and per-market-liquidity configuration stores `protocol_fee_bps` and `creator_fee_bps` as basis points of the fee. Finalization requires both values to be whole percentages, converts them by dividing by 100, and stores `protocol_pct` and `creator_pct` as `u8` percentages in the pool. `treasury_pct` is the remainder to 100.

Protocol and creator shares round down; treasury receives the remaining fee units.

## Time

`end_time`, `bid_time`, event `timestamp` fields, and swap `deadline` values are Unix seconds in signed `i64` values.

A positive swap deadline expires only when:

```text
current_time > deadline
```

Zero disables the deadline check.

## Auction levels

Auction levels are `u16` indexes into a Q64.64 square-root-price function. They are not prices and they are not basis points.

For a level:

```text
base_shift = level >> 6
remainder  = level & 63
sqrt_price_x64 = (64 + remainder) × 2^(base_shift - 6)
```

The final expression is evaluated with integer shifts. Level `4096` equals `2^64`, or a square-root price of 1.0. Every 64 levels doubles the square-root price and quadruples the underlying price.

The underlying quote-per-token price is conceptually:

```text
price = (sqrt_price_x64 / 2^64)^2
```

Price math accepts levels `0` through `8127`. Ordinary bid limits are further restricted by the auction's start level, step size, and 64-slot level-bucket capacity:

```text
level = start_level + slot × step_size
slot is 0 through 63
```

The creator bid uses a reserved limit-level sentinel and is not stored in an ordinary level slot.

## Q64.64 values

`clearing_sqrt_price` and `initial_sqrt_price_x64` are unsigned Q64.64 square-root prices stored in `u128`:

```text
real square-root price = encoded value / 2^64
```

Do not convert them through floating point when reproducing settlement math. Use integer multiply-shift and shift-divide operations with overflow checks.

## Treasury AMM prices

The pool account stores no price. Its `_price_reserved` word is a reserved wire slot kept so that existing 367-byte pool accounts stay valid, not a cached price. Every Treasury AMM price is derived from `backing`, `liquidity`, `circulating`, `inventory`, and `token_decimals`, and every reported price, including the price fields of version 3 market events and the `GetReserves` log keys `SPOT_PRICE_X64`, `ACTIVE_PRICE_X64`, and `RESERVE_VALUE_X64`, is an unsigned Q64.64 value in a `u128`.

Let:

```text
token_scale = 10^token_decimals
```

Then, as exact rationals:

```text
Reserve Value = backing × token_scale / circulating
book price    = (backing + liquidity) × token_scale / circulating
premium       = book price - Reserve Value
active price  = Reserve Value + 4 × premium × total_supply / inventory
```

Because `total_supply = circulating + inventory`, the implementation evaluates the active price as the equivalent sum of three separately scaled terms:

```text
active price = backing × token_scale / circulating
             + 4 × liquidity × token_scale / circulating
             + 4 × liquidity × token_scale / inventory
```

Each term is computed as a Q64.64 floor alongside its discarded remainder, and the remainders are recombined before the single final floor. This yields the exact Q64.64 floor of the rational result without a 256-bit intermediate. Reproducing the values by flooring each term independently, or by flooring the intermediate `Reserve Value` and `book price` to base units first, gives results that differ from on-chain reporting by a few Q64.64 units.

To recover quote-token base units per whole supply token, divide the Q64.64 value by `2^64`. To display in whole quote tokens, divide again by `10^stable_decimals`. Do the division last and keep the Q64.64 value as an integer until the display boundary.

The value `u128::MAX` is a reporting-only saturation sentinel. It means the valid rational price exceeded the Q64.64 field's representable range; it must not be displayed as a finite quote. The SDK's `isTammPriceSaturatedX64` detects it, and `tammPriceX64ToQuotePerToken` returns `null` for it. Invalid pool state remains an error and does not use this sentinel.

## Invariant width

The Treasury AMM invariant `K` is a `u128` stored as two little-endian `u64` limbs:

```text
K = k_low + (k_high << 64)
```

Use at least 128-bit integer arithmetic for `K` and wider checked intermediates when reproducing the curve off-chain.

See [Treasury AMM accounting](../concepts/treasury-amm-accounting.md) for the formulas that consume these units.
