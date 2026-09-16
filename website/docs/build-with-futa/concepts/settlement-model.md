# Settlement model

FUTA settles an auction in two stages: one permissionless finalization transaction fixes the shared outcome and creates the market, then each bidder claims independently.

This design keeps finalization bounded. It uses aggregate auction state instead of loading every bid account into one transaction.

## Live clearing is part of settlement

Settlement begins while the auction is active.

Each bid records its quote amount and limit level. In parallel, the auction maintains:

- `clearing_level`, the current single-price boundary;
- `cum_lifting_bids`, quote demand strictly above that boundary;
- `LevelBuckets`, aggregate quote demand at every valid level.

After a bid change, the program checks whether lifting demand can fill the auction at the next configured level. If it can, clearing advances and demand at the newly reached level is removed from `cum_lifting_bids`. The loop continues until demand no longer supports another step.

The finalizer therefore receives a compact clearing ledger rather than a collection it must rebuild.

## Finalization inputs

Finalization reads:

| Input                            | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| Final `clearing_level`           | Sets the common auction conversion level             |
| `cum_lifting_bids`               | Measures demand strictly above clearing              |
| Clearing-level bucket total      | Measures demand exactly at clearing                  |
| `auction_supply`                 | Caps token distribution                              |
| Launch-time fee snapshots        | Calculates protocol and creator auction fees         |
| Supply mint and auction vaults   | Partitions market inventory from bidder claim escrow |
| Global liquidity configuration   | Initializes the new market                           |
| Permanent-reserve policy version | Sizes the supply withheld from bidder allocations    |

The quote-vault balance is not treated as proceeds. It also contains refundable deposits and the creator fee liability. Proceeds are derived from the clearing ledger.

## Calculating consumed proceeds

Let `auction_cap(level)` be the quote amount required to buy the auction supply at that level.

### Clearing remains at reserve

All eligible bids form one pro-rata group at the reserve level. The reserve payout calculation determines:

- how much auction supply is sold;
- how much auction supply remains as market inventory;
- how many quote units are consumed as proceeds.

The claim calculation determines each bid's refundable portion. Refund liabilities remain in auction escrow until claims complete.

### Clearing advances above reserve

The finalizer reads the aggregate bid total at clearing and calculates:

```text
level_cap = auction_cap(clearing_level)

consumed_lifting =
    min(cum_lifting_bids, level_cap)

remaining_at_clearing =
    level_cap - consumed_lifting

consumed_at_clearing =
    min(clearing_level_bids, remaining_at_clearing)

gross_proceeds =
    consumed_lifting + consumed_at_clearing
```

This caps proceeds even when demand above clearing overshoots the available auction supply.

## Partitioning quote tokens

Protocol and creator auction fees are calculated independently from gross proceeds:

```text
protocol_cut =
    floor(gross_proceeds × protocol_fee_ppm / 1,000,000)

creator_cut =
    floor(gross_proceeds × creator_fee_ppm / 1,000,000)

market_reserves =
    gross_proceeds - protocol_cut - creator_cut
```

The protocol cut transfers immediately to the protocol recipient. The creator cut stays in auction escrow for a separate creator claim. Market reserves move into the Treasury AMM stable vault.

Deposits not consumed by settlement remain in auction escrow for bidder refunds.

## Partitioning the token supply

Before finalization, the auction vault holds the full fixed supply.

The market receives:

```text
market_inventory =
    total_supply
    - auction_supply
    + unsold_auction_supply
```

The sold auction supply does not all become bidder claim escrow. Finalization first withholds the permanent reserve:

```text
permanent_reserve =
    floor(auction_supply × reserve_bps / 10,000)

bidder_claim_escrow =
    auction_supply
    - unsold_auction_supply
    - permanent_reserve
```

`reserve_bps` comes from `AuctionState.permanent_reserve_version`, snapshotted at launch. Version `1` is `100`, so the reserve is 1% of the auction allocation. Finalization requires the computed reserve to be positive and strictly smaller than the auction allocation, and fails with `InvalidPermanentReserve` otherwise.

The reserve is transferred to a token account derived as `["permanent_reserve_vault", token_mint]` under the auction program. Its owner is derived as `["futa_permanent_reserve", token_mint]` under **Solana's System Program**, an address with no private key that no program can sign for. The balance is immobile from that transfer onward. When the reserve is positive, finalization emits `PermanentReserveEstablished`.

At this boundary:

```text
market_inventory
    + bidder_claim_escrow
    + permanent_reserve
  = total_supply
```

The Treasury AMM initializes circulating supply as:

```text
initial_circulating =
    bidder_claim_escrow + permanent_reserve
  = total_supply - market_inventory
```

That circulation includes sold allocations still waiting in auction escrow and the permanent reserve. Claiming moves escrowed tokens to bidders without changing the pool's circulation accounting, and the reserve never moves at all. Because the reserve is nonzero for every launchable configuration, `circulating` can never return to zero, so no FUTA market can reach the Treasury AMM's complete-redemption state.

## Creating the market

Finalization removes mint authority, funds the market vaults, and invokes the Treasury AMM initializer.

The initializer validates the pool and authority PDAs, vault mints and authorities, fixed mint supply, removed mint and freeze authorities, fee split, and nonzero circulation and reserves. It then derives:

```text
requested_liquidity =
    floor(market_reserves × liquidity_allocation_bps / 10,000)

backing =
    market_reserves - canonical_liquidity
```

Canonical liquidity is the highest exactly representable curve value at or below the requested allocation under the market's integer invariant.

The auction clearing level and Q64.64 clearing sqrt price are recorded in `PoolLiquidityState`. The Treasury AMM does not accept a caller-supplied opening price; it derives its initial active price from inventory, circulation, market reserves, and the liquidity allocation.

## Freezing the shared outcome

After market creation, finalization:

- snapshots the clearing-level bid total into `AuctionState`;
- records the creator fee amount;
- records the permanent reserve vault on `PoolLiquidityState`;
- marks the auction finalized;
- records initial pool configuration and balances;
- emits the auction-finalized event;
- closes `LevelBuckets` and returns its rent to the finalizer.

Claims no longer need the aggregate bucket account. They use immutable bid data plus the final values in `AuctionState`.

## Claim calculation

At claim time, the program derives two Q64.64 shrink factors:

- a clearing-level factor for demand competing for the capacity left after lifting bids;
- a lifting factor when demand strictly above clearing already exceeds total capacity.

The bid first follows one of four deterministic calculation paths:

| Auction condition           | Bid condition                                                     | Outcome                                                       |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| Clearing remains at reserve | Any eligible bid                                                  | One shared pro-rata token allocation plus unused quote refund |
| Clearing advances           | Limit above clearing, no lifting overshoot                        | Full allocation at clearing                                   |
| Clearing advances           | Limit above clearing with lifting overshoot, or limit at clearing | Pro-rata allocation plus unused quote refund                  |
| Clearing advances           | Limit below clearing                                              | Full quote refund                                             |

The table gives each bid's **gross** token outcome. Before transfer, the program applies the permanent-reserve haircut:

```text
net_tokens =
    floor(gross_tokens
          × (auction_supply - permanent_reserve)
          / auction_supply)
```

Quote refunds are deliberately left on the gross outcome, so an ordinary winning claim commits the same quote amount for a minimum token transfer equal to the gross result after the 1% haircut. The proportional haircut rounds down and applies to full, pro-rata, and reserve-level allocations. It leaves a fully refunded bid's deterministic result unchanged.

Each claim transfers its token allocation and refund from the auction vaults, emits `BidClaimed` with the amount actually transferred, and closes the `BidState`. Claim order does not change the shared clearing inputs, consumed proceeds, or fee calculation.

`AuctionState.unsettled_bid_count` tracks how many `BidState` accounts remain open. It starts at one for the creator bid, increments on each new bid, and decrements on each pre-finalization cancellation or post-finalization claim. A bid that would overflow the counter is rejected with `TooManyBids`, and a decrement below zero fails with `InvalidBidSettlement`.

The claim that decrements this counter to zero is special: it receives the entire remaining auction token-vault balance and every quote-vault unit not reserved for an unclaimed creator fee. This drains aggregate fixed-point and per-claim rounding remainders so the public vault liabilities can reach zero. The final claimant's transfer is therefore order-dependent and can exceed its deterministic calculation; it is not universally bounded to one token atom. The SDK's `projectBidSettlement` reports deterministic minimums and marks both possible final-claim sweeps, but their exact amounts require live vault state.

## Conservation and atomicity

Settlement keeps deposited quote units assigned among:

```text
protocol auction fee
+ creator auction fee
+ Treasury AMM reserves
+ bidder refunds
```

Before claims, the creator fee and bidder refund liabilities remain in auction escrow. Claims change custody, not the shared settlement totals.

Token units remain assigned among market inventory, the permanent reserve, unclaimed auction allocations, and tokens already transferred to bidders. The permanent reserve leaves that set only in the sense that it is unreachable: it is still counted, but no instruction can move it. The final-claim sweep changes only which bidder receives accumulated rounding remainder, not the auction-wide total.

Finalization is one Solana transaction. A failure during validation, token movement, mint-authority removal, market initialization, or state recording rolls back the entire operation. Bid claims remain unavailable until that transaction completes.

This boundary lets the market become active immediately after finalization while bidders settle independently.

See [Bid outcomes](../../use-futa/reference/bid-outcomes.md) for the participant-facing outcome table, [Numeric units](../reference/numeric-units.md) for fixed-point scales, and [Treasury AMM accounting](treasury-amm-accounting.md) for post-auction state transitions.
