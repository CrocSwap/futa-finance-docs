# Protocol parameters

These are FUTA's canonical Solana mainnet launch parameters.

## Auction

| Parameter                  |                          Value |
| -------------------------- | -----------------------------: |
| Quote token                |               USDC, 6 decimals |
| Auction duration           |                       24 hours |
| Token supply per launch    |             100,000,000 tokens |
| Auction supply             | 20,000,000 tokens, 20% of that |
| Token decimals             |                              6 |
| Starting price level       |                          3,528 |
| Price-level step           |                              8 |
| Stored price levels        |                             64 |
| Highest stored price level |                          4,032 |
| Protocol auction fee       |           1% of gross proceeds |
| Creator auction fee        |           2% of gross proceeds |
| Permanent reserve          |   1% of the auction allocation |
| Minimum ticker length      |                    1 character |
| Maximum ticker length      |                  10 characters |

Tickers use uppercase `A`–`Z` and digits `0`–`9`.

Mainnet USDC has six on-chain decimal places. FUTA's web forms accept at most five decimal places for quote-token bid and trade inputs and truncate additional digits while typing. This is an interface limit, not an on-chain or SDK unit change; integrations continue to use all quote-token base units.

The permanent reserve is 100 basis points of the auction allocation, withheld at finalization and locked forever. Ordinary per-bid settlement applies a 1% token haircut; quote-refund calculations are unchanged, and the final unsettled claim receives any remaining public-vault rounding remainder. [See how it affects a bid](bid-outcomes.md).

The starting level is the auction's reserve. New public bids must use a step-aligned level above the live clearing level. With the launch range, public bid levels extend from 3,536 through 4,032 while the clearing level remains at the reserve.

## Treasury AMM

| Parameter                     |                         Value |
| ----------------------------- | ----------------------------: |
| Curve exponent                |                             4 |
| Initial liquidity allocation  | 0.77% of net auction reserves |
| Swap fee                      |      1% of gross quote amount |
| Treasury share of market fees |   60% plus rounding remainder |
| Protocol share of market fees |                           10% |
| Creator share of market fees  |                           30% |
| Minimum retained inventory    |                 1 whole token |

The swap fee is `ceil(gross quote amount × 100 / 10,000)`. For a buy, gross quote amount is the total quote-token input. For a sell, it is the quote-token output before the fee is deducted.

[See exact fee calculations](fees.md)

## Configured per market

Auction fee terms are fixed when the auction launches. Treasury AMM liquidity allocation and fee-recipient shares are copied into the market when finalization creates it, so later global configuration changes do not rewrite an existing market. The 1% swap fee is a protocol constant rather than per-market configuration.

## Other deployments

The table above is the mainnet policy. FUTA's test deployments run the same programs under a different configuration — a shorter auction, a different reserve level and supply, and a different fee split. Nothing in the protocol requires the two to agree.

Always read the values the interface shows for the specific auction or market you are looking at rather than assuming the mainnet numbers.
