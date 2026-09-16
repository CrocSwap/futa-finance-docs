# Glossary

## Active price

The marginal price for the next unit along the Treasury AMM curve. It is different from the pool's average book price and a trade's average execution price.

## Auction proceeds

Quote tokens consumed by winning allocations at the clearing price. Refundable quote tokens are not proceeds.

## Auction supply

The portion of a ticker's fixed token supply offered through its launch auction.

## Backing

Quote-token reserves assigned to Reserve Value for circulating tokens.

## Basis point

One hundredth of one percent. `100` basis points equals `1%`.

## Bid limit

The highest price level a bidder accepts. It determines whether the bid is eligible; winning tokens are still calculated at the clearing price.

## Book price

Backing plus liquidity, divided by circulating supply.

## Clearing level

The discrete price level at which the auction settles. It starts at the reserve and can only move upward.

## Circulating supply

Ticker tokens accounted outside the Treasury AMM inventory. Unclaimed auction allocations and the permanent reserve are both treated as circulating when the market is initialized.

## Complete redemption

A sell that returns every circulating token to the Treasury AMM, leaving zero backing, liquidity, and reported prices. FUTA markets cannot reach this state, because the permanent reserve keeps circulating supply above zero.

## Creator

The wallet that launches a ticker, claiming its FUTA symbol and opening its auction. It receives the launch's creator fee right, but creator fees follow that transferable right rather than the creator's address.

## Creator fee right

The transferable one-of-one NFT that authorizes claiming a launch's creator fees, both the auction fee and the accruing market fees. Whoever holds it can claim.

## Embedded wallet

A Solana wallet FUTA creates for a user who signs in with email, Google, or Apple, held by FUTA's wallet provider rather than by wallet software the user installed. It signs without a per-transaction wallet prompt. See [Connect a wallet](../guides/connect-a-wallet.md).

## External wallet

A Solana wallet the user already holds — an extension, mobile, or hardware wallet — that FUTA connects to and that prompts for each signature.

## Finalization

The permissionless settlement operation after an auction ends. It fixes outcomes, distributes auction fees, creates the Treasury AMM, removes mint authority, and opens claims.

## Inventory

Ticker tokens held by the Treasury AMM and available for future buys.

## Lifting bid

A bid whose limit is strictly above the current clearing level. Lifting demand can move the clearing level upward.

## Liquidity

The quote-token reserve component that supports the Treasury AMM's premium curve above Reserve Value.

## Parts per million

A fee unit used for auctions. `10,000` parts per million equals `1%`.

## Permanent reserve

The 1% of an auction's token allocation withheld at finalization and sent to a vault that no key and no program can sign for. It reduces the aggregate public claim supply, counts as circulating supply, and can never be sold.

## Premium

Book price minus Reserve Value.

## Price level

A discrete index that encodes an auction price. Higher levels represent higher token prices.

## Quote token

The SPL token used for bids, auction proceeds, market reserves, swap payments, and fee claims.

## Reserve level

The auction's starting and minimum clearing level.

## Reserve Value

Gross backing per circulating token, before swap fees.

## Ticker

The uppercase alphanumeric symbol that identifies one token mint and one market within FUTA.

## Treasury-Aware Market Maker (TAMM)

FUTA's post-auction automated market maker. TAMM stands for Treasury-Aware Market Maker and combines token inventory with separate backing and liquidity reserve components.
