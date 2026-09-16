# Place a bid

Place a bid during an active auction by choosing the amount of quote tokens to commit and the highest market-cap level you accept.

## Before you begin

You need:

- a [connected wallet](connect-a-wallet.md);
- enough quote tokens for the bid; and
- SOL for network fees and account rent.

An accepted bid transfers its full quote-token amount into auction escrow. You cannot reduce that amount after the bid is accepted, and you can cancel only if the bid becomes priced out.

## Place the bid

1. Open **AUCTIONS**.
2. Select an active ticker auction.
3. Enter the amount you want to commit under **BID SIZE**.
4. Choose your limit under **MAX MARKET CAP**.
5. Review the displayed bid details.
6. Select **BID**.
7. Review and approve the transaction when prompted. An external wallet asks you to sign; an embedded wallet signs without a prompt.
8. Wait for the confirmation message before treating the bid as accepted.

**MAX MARKET CAP** is your bid limit, not a promised fill or execution value. Winning bids settle at the auction's shared clearing price. Your final token allocation and any refund depend on the clearing level and total demand.

[See how bid outcomes are calculated](../reference/bid-outcomes.md).

## After the bid confirms

Open **ACCOUNT**, then **BIDS**, to track the bid. The live clearing level can rise as later bids arrive, so your bid can move from above clearing to at clearing or below clearing before the auction ends.

If the transaction fails or you reject it in your wallet, no new bid is created. Refresh the auction or your account before retrying if the result is unclear.
