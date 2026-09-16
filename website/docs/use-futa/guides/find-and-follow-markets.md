# Find and follow markets

Use the auction and trade explorers to compare tickers, follow activity, inspect participants, and share a market. These read-only features do not require a connected wallet.

## Browse auctions

Open **AUCTIONS** to see active auctions. From there, you can:

- use **SEARCH AUCTIONS…** to match a ticker or token address;
- select a column heading to sort the list;
- open **FILTERS** to narrow the list by:
    - bid status for the connected wallet;
    - auctions you have bid on;
    - minimum market cap;
    - maximum time remaining;
    - minimum open-bid fill; or
    - completed auctions.

The search text is mirrored into the page URL as `?q=`, so a search result can be bookmarked or shared. The **FILTERS** settings are not part of that link: they are stored in this browser and reapplied on your next visit. Filters that depend on your bids require a connected wallet.

Select an auction, then select the eye control beside its ticker to add it to your watchlist, or use the terminal's `watch [ticker]` and `unwatch [ticker]`. Turn on the watchlist filter to show only followed tickers, or run `watchlist` in the terminal to list what you follow with the time each auction has left; `watchlist clean` drops the ones that have closed, and `watchlist reset` empties the list after asking. The watchlist is not an on-chain account: it is stored in this browser and reapplied on your next visit, so it does not follow you to another device or survive clearing site data.

## Read the feed and auction chart

The panel beside the auction list has two views:

- **FEED** shows recent launches, clearing-level changes, and auction completions observed by FUTA's best-effort event service;
- **CHART** groups the loaded auctions by market cap and time remaining.

The feed is a discovery aid, not authoritative history. Confirm any action against the auction account and its finalized Solana transaction.

On a small screen, use the **AUCTIONS**, **FEED**, and **CHART** views above the page to switch between these surfaces.

## Explore active markets

Open **TRADE**, then **EXPLORE**, to compare finalized markets. You can search by ticker or mint, sort by ticker, age, market cap, spot price, or 24-hour volume, and filter by minimum market cap, minimum 24-hour volume, or maximum token age. **MY TOKENS** limits the table to markets whose tokens the connected wallet holds.

Select a ticker to open its market. Depending on screen size, the page presents **EXPLORE**, **TRADE**, **CHART**, and **INFO** as panels or tabs. The chart can display price or market cap and can be zoomed through the available candle history.

**INFO** shows auction and market statistics. Open **HOLDERS** to inspect nonzero token accounts. For a live auction, its information panel instead offers **BIDDERS**, including bid size, limit, and current in/out status. Holder and bidder lists are point-in-time reads and can change after they load.

## Share a ticker

Select **SHARE** from an auction's information panel or a finalized market's information view. FUTA can copy a direct link or generate a share card and QR code. The link preserves whether the recipient should open the auction or trade surface.

Always verify the mint address before acting on a shared ticker. Symbols are unique within FUTA, not across all of Solana.
