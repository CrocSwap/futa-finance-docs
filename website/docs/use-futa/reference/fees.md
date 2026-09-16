# Fees

FUTA has separate fee systems for auctions and Treasury AMM markets.

## Auction fees

Auction fees are calculated from the gross quote-token proceeds consumed by the auction.

| Fee                  | Launch rate | Calculation                                  |
| -------------------- | ----------: | -------------------------------------------- |
| Protocol auction fee |          1% | `floor(gross proceeds × 10,000 / 1,000,000)` |
| Creator auction fee  |          2% | `floor(gross proceeds × 20,000 / 1,000,000)` |

The two fees are calculated independently from the same gross proceeds. They are not applied sequentially.

After finalization:

- the protocol fee is transferred to the protocol fee destination;
- the creator fee remains claimable through the launch's creator fee right, once that right is initialized;
- gross proceeds minus both fees initialize the market's quote reserves.

Auction fees are charged in quote tokens. They are separate from the permanent reserve, which is withheld in supply tokens from bidder allocations. [See how the reserve affects a bid](bid-outcomes.md).

The fee rates are fixed for an auction when it launches. The rates above are the mainnet launch policy; [see protocol parameters](protocol-parameters.md) for the rest of that policy and for how other deployments differ.

## Treasury AMM swap fee

Every buy and sell pays a fixed 1% fee, or 100 basis points, on its gross quote-token amount:

```text
swap fee = ceil(gross quote amount × 100 / 10,000)
```

For a buy, the gross quote amount is the total quote-token input, including the fee. For a sell, it is the quote-token output before the fee is deducted.

The calculation rounds up to the nearest quote-token base unit. A dust-sized swap can therefore have an effective percentage above 1%, even though the configured rate is fixed at 100 basis points.

## Market fee distribution

Each market fee uses this launch split, snapshotted into the market at finalization:

| Destination |                      Share of fee |
| ----------- | --------------------------------: |
| Treasury    | 60% plus split-rounding remainder |
| Protocol    |                               10% |
| Creator     |                               30% |

Protocol and creator shares round down to the quote token's smallest unit. The treasury receives the remainder so the complete fee is accounted for.

Treasury routing depends on trade direction:

- on buys, the treasury share reinforces active liquidity and can increase the curve constant;
- on sells, the treasury share reinforces backing.

The Treasury AMM also defines a third case, in which a sell returns the last circulating token and the treasury share becomes claimable by the protocol because no holders remain to back. FUTA's permanent reserve keeps circulating supply above zero permanently, so no FUTA market reaches that case.

Protocol and creator market fees accumulate separately from backing and liquidity until claimed.
