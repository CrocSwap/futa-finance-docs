# Trade a ticker

Buy or sell a finalized ticker through its Treasury AMM.

## Before you begin

You need:

- a [connected wallet](connect-a-wallet.md);
- SOL for network fees;
- quote tokens for a buy, or ticker tokens for a sell; and
- a finalized auction with an active market.

If an ended auction has not been finalized, select **FINALIZE AUCTION** and approve that transaction before trading. An embedded wallet is shown FUTA's own confirmation, with the estimated cost, in place of a wallet prompt. Finalization is a one-time shared action; anyone can submit it.

## Submit a trade

1. Open **TRADE**.
2. Choose the ticker.
3. Select **BUY** or **SELL**.
4. Enter the amount. Use the **USD** and ticker controls to choose which unit you enter.
5. Review **EXPECTED OUTPUT**.
6. Expand the quote details and review **PRICE IMPACT**, **AVERAGE PRICE**, **SLIPPAGE TOLERANCE**, and **SWAP FEE**.
7. Select **SUBMIT**.
8. Review and approve the transaction when prompted. An external wallet asks you to sign; an embedded wallet signs without a prompt.
9. Wait for the bought or sold confirmation before treating the trade as complete.

The quote reflects the market state observed by FUTA; it does not reserve that output. Another confirmed trade can move the market before yours executes. Slippage tolerance sets the minimum output you accept, and the transaction fails if execution would return less.

Larger trades can have greater price impact. Very small trades can also fail when base-unit rounding leaves no executable output.

[See trading risks and execution limits](../reference/risks-and-limitations.md#swap-execution).
