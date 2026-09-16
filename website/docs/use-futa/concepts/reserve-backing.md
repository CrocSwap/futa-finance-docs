# Reserve backing

Reserve backing is the quote-token capital assigned to circulating tokens in a Treasury AMM.

## Reserve Value

Reserve Value is the gross backing per circulating token. Using displayed whole-token amounts:

```text
Reserve Value = backing / circulating supply
```

On-chain calculations use integer base units and account for the ticker token's decimal scale. It is an accounting value before swap fees. A seller's result also includes liquidity released by the market curve and subtracts the applicable market fee.

## How backing changes

When tokens enter circulation through a buy, the market adds backing for those tokens. Integer rounding and curve releases are retained in backing rather than discarded.

When tokens return through a sell, the market releases their proportional share of backing. The treasury share of the sell fee remains in backing for the tokens still circulating.

As a result, a trade preserves or increases Reserve Value. The displayed value may remain unchanged when the difference is smaller than the quote token's smallest unit.

## Backing and liquidity are different

Backing supports Reserve Value. Liquidity supports the premium and determines how the active market price changes as inventory moves.

Moving value between these components changes the shape of the market even when their sum stays the same. For that reason, FUTA reports them separately.

## Circulation never empties

The Treasury AMM's accounting defines an end state, complete redemption, in which the last circulating token is sold: backing, liquidity, circulating supply, and Reserve Value all fall to zero and inventory becomes the full token supply.

FUTA markets never reach it. Each auction locks 1% of its allocation in a permanent reserve that is counted as circulating supply and can never be sold, so circulating supply always stays above zero and Reserve Value stays defined.

[Read about the permanent reserve](../reference/bid-outcomes.md)

[See market fee calculations](../reference/fees.md)
