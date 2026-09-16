# Treasury-Aware Market Maker (TAMM)

Every finalized FUTA auction opens a Treasury-Aware Market Maker (TAMM) for its ticker. The market holds token inventory and quote-token reserves, then prices buys and sells along a deterministic curve.

## Two reserve components

The market separates quote reserves into:

- **Backing**, which supports Reserve Value for circulating tokens.
- **Liquidity**, which supports the curved market premium above Reserve Value.

Together, backing and liquidity form the market's accounted quote reserves. Protocol and creator fees remain separately claimable and are not counted as either component.

Every buy and sell pays a fixed 1% fee on its gross quote-token amount. The treasury share reinforces the market, while protocol and creator shares remain claimable.

## Three useful prices

- **Reserve Value** is backing divided by circulating supply.
- **Book price** is backing plus liquidity, divided by circulating supply.
- **Active price** is the marginal price for the next unit along the market curve.

The difference between book price and Reserve Value is the market's **premium**.

## Buying

A buy moves tokens from market inventory into circulation. Quote tokens pay for the new tokens' backing and the liquidity required by the curve.

The treasury share of a buy fee reinforces active liquidity. This can increase the market's curve constant and deepen the premium layer. Any amount that cannot be represented exactly by the integer curve is retained as backing.

## Selling

A sell returns tokens to market inventory and reduces circulating supply. The seller receives a proportional release of backing plus liquidity released by the curve, less the market fee.

The treasury share of a sell is retained as backing. This preserves or increases Reserve Value for the remaining circulating tokens.

## Circulation never empties

The Treasury AMM defines a complete redemption: if every circulating token were returned, circulating supply, backing, liquidity, and reported prices would fall to zero and the market would hold the entire supply as inventory.

No FUTA market can reach that state. Each auction locks 1% of its allocation in a permanent reserve that counts as circulating supply and that no key or program can sign for. Circulating supply therefore always stays above zero, the market always has holders to back, and Reserve Value stays defined for the life of the market.

## Inventory boundary

The Treasury AMM always retains at least one whole token of inventory. A buy cannot remove the final inventory token.

[Understand reserve backing](reserve-backing.md)

[See exact fee calculations](../reference/fees.md)
