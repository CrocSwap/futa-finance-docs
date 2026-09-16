# Ticker markets

On FUTA, one ticker points to one market. Launching a ticker claims its FUTA symbol, creates its token, opens its auction, and reserves that ticker within FUTA.

Every ticker market follows the same lifecycle.

## 1. Launch

The creator chooses an available ticker and commits the required opening bid in the auction's quote token. FUTA creates a new SPL token mint, mints its fixed supply into protocol-controlled custody, records the ticker-to-mint relationship, and opens the auction atomically.

Tickers contain uppercase letters and numbers. A ticker cannot be claimed again after its market has been created.

## 2. Price discovery

The auction begins at its reserve price and runs for a fixed period. Participants bid with the quote token and choose the highest price level they are willing to accept.

Demand moves the clearing level upward. The clearing level never moves backward, and every winning allocation is calculated at the final clearing price rather than at each bidder's limit.

[Learn how single-price auctions work](single-price-auctions.md)

## 3. Finalization

After the auction ends, anyone can finalize it. Finalization:

- fixes the final auction outcome;
- calculates protocol and creator auction fees;
- withholds 1% of the auction allocation as a permanent reserve;
- moves the remaining token inventory and net quote proceeds into a Treasury AMM;
- removes the token mint authority;
- opens claims for bidders.

The auction and its post-auction market are connected in one settlement operation.

## 4. Claims

Each bidder claims separately. A claim can deliver tokens, return unused quote tokens, or do both, depending on the bid's position relative to the clearing level.

[Look up bid outcomes](../reference/bid-outcomes.md)

## 5. Treasury AMM market

The Treasury AMM becomes the ticker's continuing market. It holds unsold inventory and separates its quote reserves into reserve backing and active liquidity.

The permanent reserve sits outside that inventory, in a vault nobody can sign for. The market counts it as circulating supply, so some circulation always remains and the market always has holders to back.

[Understand the Treasury AMM](treasury-amm.md)
