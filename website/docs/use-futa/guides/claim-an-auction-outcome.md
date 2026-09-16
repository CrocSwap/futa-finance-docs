# Claim an auction outcome

After an auction ends, claim the tokens and quote-token refund assigned to your bid.

## Before you begin

You need the wallet that placed the bid and enough SOL to submit any required transaction. The auction must be finalized before the claim can complete.

Finalization is a one-time shared action that settles the auction and creates its Treasury AMM. Anyone can submit it. If the auction is not yet finalized, FUTA includes the required finalization step in the claim flow.

## Claim one bid

1. Open **ACCOUNT**, then **BIDS**.
2. Find the completed bid.
3. Select **CLAIM** or **CLAIM REFUND**.
4. Review the assets and estimated SOL cost shown in the claim window.
5. Follow the action the window shows: complete **FINALIZE** first if it is a separate step, select **FINALIZE & CLAIM** if the steps can be combined, or select **CLAIM** if the auction is already finalized.
6. Review and approve each requested transaction. An external wallet asks you to sign each one. An embedded wallet signs without a wallet prompt, so FUTA shows its own confirmation, with the estimated SOL cost or rent refund, before it submits.
7. Wait for confirmation before treating the assets as received.

You can also open the completed auction and use its claim button.

One claim can return auction tokens, unused quote tokens, or both. A refund-only outcome shows **CLAIM REFUND**. A successful claim closes the bid's on-chain record and returns its SOL rent to your wallet.

The final unsettled claim for an auction also receives any token and refundable quote rounding remainder left in the public auction vaults. That extra amount depends on which bid is claimed last, so the preview shows the deterministic result rather than promising an exact final-sweep bonus.

## Claim several bids

Select **CLAIM ALL** under **ACCOUNT** → **BIDS** to process every available bid outcome. FUTA may divide the work into multiple transactions. Wallets that support batch signing approve the whole set once; others approve each transaction separately. An embedded wallet signs the set after FUTA's own confirmation, with no wallet prompt.

If a later transaction fails, claims already confirmed on Solana remain complete. Reopen **BIDS** and retry the outcomes that are still available.

The market becomes active when finalization succeeds; bidders do not all need to claim before trading begins.

[See the exact settlement outcomes](../reference/bid-outcomes.md).
