# TAMM accounting

The Treasury-Aware Market Maker (TAMM) tracks token distribution, two quote-reserve components, a curve constant, and claimable fee balances.

## State

| Field                | Meaning                                          |
| -------------------- | ------------------------------------------------ |
| `inventory`          | Supply tokens held by the market                 |
| `circulating`        | Supply tokens accounted outside market inventory |
| `backing`            | Quote reserves assigned to Reserve Value         |
| `liquidity`          | Quote reserves assigned to the premium curve     |
| `total_supply`       | Fixed supply-token total                         |
| `K`                  | Exponent-four curve constant                     |
| `protocol_fees_owed` | Quote fees claimable by the protocol recipient   |
| `creator_fees_owed`  | Quote fees claimable by the creator              |

The core token conservation rule is:

```text
inventory + circulating = total supply
```

Claimable protocol and creator fees are held in the stable vault but remain outside `backing` and `liquidity` accounting.

## Initialization

Finalization creates the market from the auction result:

```text
initial circulating = total supply - initial inventory
requested liquidity = floor(net auction reserves × liquidity_allocation_bps / 10,000)
backing = net auction reserves - canonical liquidity
```

The implementation canonicalizes requested liquidity to an exactly representable integer state before storing `K` and `liquidity`.

`liquidity_allocation_bps` is protocol configuration, not a constant. Finalization copies it from `LiquidityConfig` into the market's `PoolLiquidityConfig`, so read the per-market snapshot rather than assuming a value. Mainnet launches use `77`, or 0.77% of net auction reserves; other deployments differ.

Initial circulation has two parts: the sold auction allocations still held in auction claim escrow, and the auction's permanent reserve. The reserve is 1% of the auction allocation, held in a vault whose owner is a program-derived address of the System Program, so nothing can sign to move it. The Treasury AMM has no special handling for it; it is ordinary circulating supply that will never be presented for a sell.

## Invariant

The conceptual invariant is:

```text
K = liquidity × (inventory / circulating)⁴
```

All on-chain calculations use checked integer arithmetic and canonical inverse calculations rather than floating point. Stored liquidity must equal the value recovered from `K`, `circulating`, and `inventory`.

For sells, `K` remains fixed. For buys, the treasury fee share is reinvested into liquidity and can increase `K`; `K` never decreases.

## Price definitions

Let `scale = 10^token_decimals`.

```text
Reserve Value = floor(backing × scale / circulating)
book price = floor((backing + liquidity) × scale / circulating)
premium = book price - Reserve Value
active price = Reserve Value
             + floor(4 × premium × total supply / inventory)
```

Prices are quote-token base units per whole supply token. If a valid price is too large for the Q64.64 `u128` reporting field, reporting uses `u128::MAX` as a saturation sentinel; it is not a finite price. Invalid underlying state still fails validation rather than producing the sentinel.

## Buy transition

For a quote-token input:

1. Calculate the fixed 1% fee from the gross quote input.
2. Subtract the fee to obtain net quote input.
3. Find the maximum token output whose backing requirement plus invariant liquidity increase fits within that net input.
4. Decrease inventory and increase circulating supply by the token output.
5. Add backing for the newly circulating tokens.
6. Route curve release, unspent integer remainder, and non-representable reinvestment remainder to backing.
7. Add the treasury fee share to desired liquidity, canonicalize it, and increase `K` when required.
8. Add protocol and creator shares to their claimable balances.

The market retains at least one whole supply token in inventory.

## Sell transition

For a supply-token input:

1. Calculate backing released as the token input's proportional Reserve Value.
2. Increase inventory and decrease circulating supply.
3. Recover the new liquidity value from the unchanged `K`.
4. Calculate gross quote output as backing released plus liquidity released.
5. Calculate the fixed 1% fee from gross quote output and subtract it.
6. Add the treasury fee share to backing.
7. Add protocol and creator shares to their claimable balances.

This preserves or increases Reserve Value after integer rounding.

## Complete redemption

The Treasury AMM is a general market program and retains a complete-redemption branch for the case where token input equals circulating supply:

- gross output is all backing plus liquidity;
- the market fee is subtracted from that output;
- the creator share remains claimable through the creator fee right;
- the ordinary treasury share is added to the protocol share, because backing is zeroed and a treasury share routed there would be stranded;
- circulating supply, backing, liquidity, and reported prices become zero;
- inventory becomes the full token supply.

**This branch is unreachable for every FUTA market.** Pools can only be created by auction finalization, finalization always establishes a positive permanent reserve, and that reserve is counted as circulating supply in a vault nothing can sign for. `circulating` therefore has a permanent nonzero floor. Integrations should treat zero circulation, zero backing, and zero reported prices as states that do not occur, rather than as states to handle.

## Fee rounding

For buys, the fee basis is gross quote input. For sells, it is gross quote output before the fee deduction. The fixed fee calculation `ceil(gross quote amount × 100 / 10,000)` rounds up to the nearest quote-token base unit. During fee splitting, protocol and creator shares round down and the treasury receives the remainder.
