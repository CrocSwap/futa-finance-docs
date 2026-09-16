# Launch a ticker

Launch a new ticker by claiming its FUTA symbol, creating its token mint, opening its auction, and placing the required creator bid in one transaction.

## Before you begin

You need:

- a [connected wallet](connect-a-wallet.md);
- enough quote tokens for the displayed **CREATOR BID**; and
- SOL for network fees and account rent.

A successful launch permanently assigns the ticker within FUTA. The creator bid is an auction deposit, not a listing fee: FUTA transfers it into auction escrow and settles it under the auction's bid-outcome rules.

## Launch the ticker

1. Open **CREATE**.
2. Enter the symbol under **TICKER**.
3. Wait for FUTA to confirm that the ticker is valid and available.
4. Review the required **CREATOR BID**, then select **CREATE AUCTION**.
5. On the confirmation screen, review the ticker, creator bid, auction supply, and pool liquidity.
6. Select **CONFIRM**.
7. Review and approve the transaction when prompted. An external wallet asks you to sign; an embedded wallet signs without a prompt.
8. Wait for **TICKER CREATED** before treating the launch as complete.

The availability check does not reserve a ticker. If another launch claims it before your transaction executes, your launch fails and the interface asks you to choose again.

## After launch

Select **VIEW AUCTION** to open the new auction. The creator bid appears with the creator's other bids and can be claimed after the auction is finalized.

The launch transaction creates the fixed token supply, records its ticker, creates launch metadata when that deployment enables it, and opens the auction. Finalization later settles the auction and creates the Treasury AMM. A separate permissionless transaction then creates the one-of-one creator fee-right NFT for eligible launches; the creator receives that NFT even if someone else pays to initialize it.

[Understand the complete ticker lifecycle](../concepts/ticker-markets.md).
