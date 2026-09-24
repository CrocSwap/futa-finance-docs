# Start here

Follow one ticker from its live auction to its post-auction market. This tour is read-only: you do not need to connect a wallet or submit a transaction, and it teaches the complete lifecycle before you commit anything.

## 1. Open a live auction

1. Open **AUCTIONS**.
2. Select a ticker marked **OPEN**.
3. Find **STATUS**, **TIME REMAINING**, and **MARKET CAP** beside the ticker.

The auction's market cap reflects its current clearing level. It can move upward as later demand arrives. **TIME REMAINING** shows how long bidding remains open.

## 2. Read the demand

Find the **OPEN BID** section. It shows the market-cap level currently open to new demand, the quote-token **BID SIZE** at that level, and the amount currently **FILLED**.

Select the information icon beside the ticker. The auction details show its **AUCTION SUPPLY**, quote tokens **RAISED**, and current number of **BIDDERS**.

You have now seen the two sides of the live auction:

- the clearing level summarizes the price established by demand so far;
- bid limits and aggregate demand determine which bids are currently above, at, or below that level.

No result is final until the auction ends and is finalized.

## 3. Compare a completed auction

1. Return to the auction list.
2. Select a ticker marked **CLOSED** that has an active market. If it is still awaiting finalization, choose another closed ticker for this tour.
3. Open its information panel.

A completed, finalized ticker replaces live bidding information with settled auction and market information. **RAISED** and **AUCTION SUPPLY** describe the launch. **PRICE**, **MARKET CAP**, **24H VOLUME**, and **HOLDERS** describe its continuing market.

Finalization fixes the bid outcomes and creates the ticker's Treasury AMM. Individual bidders can claim later; the market does not wait for every claim.

## 4. Preview a market quote

1. Open **TRADE**.
2. Choose the same finalized ticker.
3. Select **BUY** or **SELL**.
4. Enter an amount without connecting a wallet.
5. Read **EXPECTED OUTPUT**, then expand the details.

Compare **PRICE IMPACT**, **AVERAGE PRICE**, **SLIPPAGE TOLERANCE**, and **SWAP FEE**. The quote changes with the direction and size of the trade because the Treasury AMM calculates execution from its current inventory and quote reserves.

Entering an amount only requests a quote. It does not move assets. Leave the wallet disconnected to finish the tutorial without a transaction.

## What you learned

A FUTA ticker moves through one continuous lifecycle:

1. launch creates the ticker, token, auction, and creator bid;
2. public demand moves the auction's clearing level;
3. finalization settles bids and creates the Treasury AMM;
4. the Treasury AMM provides the continuing market.

Next, [learn how single-price auctions work](concepts/single-price-auctions.md). When you are ready to participate, [connect a wallet](guides/connect-a-wallet.md), then [place a bid](guides/place-a-bid.md).
