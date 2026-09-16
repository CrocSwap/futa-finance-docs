# Single-price auctions

FUTA uses a fixed-time auction with one clearing price. Bidders choose how much quote token to commit and the highest price level they are willing to pay.

## The clearing level

The auction starts at a reserve level. As eligible demand becomes sufficient to fill the auction at higher prices, the clearing level advances one configured step at a time.

A new bid must be placed above the current clearing level. Existing bids can become clearing-level bids or priced-out bids as demand moves the level upward.

The clearing level only moves upward. This makes the current level a live lower bound for the auction's eventual clearing price.

## One price for winning allocations

A bid's limit is not the price it automatically pays. It is the highest price the bidder accepts.

After finalization, winning token allocations are calculated at the final clearing level:

- bids above clearing are eligible for a full allocation;
- bids at clearing share the remaining capacity pro rata;
- bids below clearing receive their quote tokens back.

If demand above the clearing level itself overshoots the available capacity, those bids are also reduced pro rata. This keeps total token distribution within the auction supply.

Separately from the clearing rules, finalization withholds 1% of the auction allocation as a permanent reserve. An ordinary claim's deterministic token amount is 99% of the allocation the clearing calculation assigns, rounded down; quote refunds use the gross outcome. The final unsettled claim also receives any public-vault rounding remainder. [See how the reserve and final sweep apply](../reference/bid-outcomes.md)

## Reserve-level outcome

If the clearing level remains at the reserve, all open bids share the available auction supply pro rata at the reserve price. Quote tokens that are not used are returned during claim.

## Why use limit levels?

A limit level lets a bidder express a maximum acceptable price without requiring them to predict the exact final price. Every successful bid receives the same clearing-price treatment, while capacity is shared proportionally where demand meets the boundary.

[See the exact outcome table](../reference/bid-outcomes.md)
