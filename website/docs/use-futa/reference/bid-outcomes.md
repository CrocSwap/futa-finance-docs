# Bid outcomes

Every bid is settled against the auction's final clearing level. The bid's limit determines eligibility; the final clearing price determines its token conversion.

## Standard outcomes

| Bid position         | Token result                              | Quote-token result                                   |
| -------------------- | ----------------------------------------- | ---------------------------------------------------- |
| Limit above clearing | Full allocation at the clearing price     | No refund, unless lifting demand overshoots capacity |
| Limit at clearing    | Pro-rata allocation at the clearing price | Unused portion refunded                              |
| Limit below clearing | No tokens                                 | Full bid refunded                                    |

## Lifting-demand overshoot

"Above clearing" normally produces a full allocation. One exception applies when the combined demand above clearing exceeds the auction capacity at that clearing level.

In that case, all above-clearing bids receive the same proportional reduction. Each receives a pro-rata token allocation and a refund of its unused quote tokens.

## Reserve-level outcome

When the auction finishes at its reserve level, all open bids are treated as one pro-rata group. Each receives tokens at the reserve price and a refund for any quote tokens not consumed.

## The permanent reserve

Every auction withholds 1% of its token allocation as a permanent reserve. The withholding happens once, at finalization. The same proportional haircut is used for every bid's deterministic calculation.

The table above describes each bid's **gross** outcome: the allocation the clearing rules assign it. An ordinary claim's deterministic token amount is the gross allocation multiplied by 99% and rounded down.

Quote tokens are not adjusted. Refunds are still calculated from the gross outcome, so an ordinary winning claim commits the same quote amount and has a deterministic token minimum 1% below its gross result. Its effective price is about 1.01 times the clearing price before any final-claim sweep.

A fully refunded bid has no deterministic token reduction, because it receives no tokens.

The reserved tokens go to a vault that no key and no program can sign for. They are counted as circulating supply in the Treasury AMM and can never be sold or recovered.

## Rounding

Token allocations and refunds are calculated in the smallest units of the supply and quote tokens. Pro-rata multiplication and the permanent-reserve reduction both round down.

The final unsettled bid claim receives all supply tokens left in the public auction vault and all quote tokens left after preserving any unclaimed creator fee. That sweep assigns the auction's accumulated fixed-point and per-bid rounding remainder instead of stranding it. It means the final claimant can receive more tokens or refund than the deterministic per-bid estimate, and the difference is order-dependent rather than universally limited to one base unit. The shared clearing price, gross proceeds, fees, and permanent reserve do not change.

## Cancellation and claim

A bid can be cancelled for a full refund after its limit falls below the live clearing level. A priced-out bid can also remain open and receive the same full refund through the normal claim path after finalization.

Claims are available only after finalization. A successful claim transfers the token allocation and quote refund together, then closes the bid record. Cancellation is disabled after finalization so exactly one remaining bid can receive the final sweep.
