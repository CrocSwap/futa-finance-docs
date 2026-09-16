# Auction states

An auction moves through three public lifecycle states.

| State                 | Condition                                                                 | What can happen                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Active                | Current time is before the end time and the auction is not finalized      | New bids, bid increases, and eligible bid edits are accepted. Priced-out bids can be cancelled.                                      |
| Awaiting finalization | Current time is at or after the end time and the auction is not finalized | No new bidding. Anyone can finalize the auction. The protocol still permits cancellation of priced-out bids.                         |
| Finalized             | Finalization completed                                                    | Bid outcomes can be claimed, the launch's creator fee right can be initialized and its fees claimed, and the Treasury AMM is active. |

## Active

The auction starts at its configured reserve level. Demand can move the clearing level upward during bidding.

A new bid must:

- commit more than zero quote tokens;
- use a valid configured price level;
- set its limit above the current clearing level.

You can increase the quote-token commitment of an unsettled bid above clearing. You can move a bid at or above clearing to a different valid level above clearing. Bid amounts cannot be reduced in place.

## Awaiting finalization

The auction stops accepting new bidding actions when its end time is reached. Finalization is permissionless and settles the shared auction state from on-chain demand.

Bid claims remain closed until finalization completes because finalization creates the Treasury AMM and reserves the correct token and quote balances for every claim.

The interface uses the post-finalization claim flow for refunds after the auction ends rather than exposing post-end cancellation.

## Finalized

Finalization records the clearing-level demand, calculates auction fees, withholds the permanent reserve, initializes the Treasury AMM, removes mint authority, and opens claims.

Each claim closes that bid's on-chain record after transferring the correct assets and returning its account rent. Cancellation is disabled after finalization; remaining bids must use the claim path so the protocol can identify one final claim to drain public-vault rounding remainders.

Creator fees need one more step. Finalization makes them available but does not create the launch's creator fee right, which is a separate one-time transaction anyone can submit. Until it runs, the fees are not claimable. [See how to claim creator fees](../guides/claim-creator-fees.md)
