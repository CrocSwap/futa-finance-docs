# Risks and limitations

FUTA transactions move real assets on Solana. Review the amount, ticker mint, bid limit, minimum swap output, and receiving wallet before signing.

FUTA does not guarantee a bid allocation, a particular clearing price, continuous market liquidity, a future market price, or a profit.

## Auction commitments

An accepted bid transfers quote tokens into auction escrow. The following limits apply until the bid is settled:

| Limitation                      | Effect                                                                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bid amount cannot decrease      | You can add quote tokens to an eligible bid, but you cannot withdraw part of its amount.                                                                             |
| Cancellation is conditional     | You can cancel only after the bid's limit falls below the live clearing level.                                                                                       |
| A limit is not a promised fill  | It caps the price level you accept. Final allocation still depends on clearing and total demand.                                                                     |
| Clearing can move after you bid | A bid can move from above clearing to at clearing or below clearing as later demand arrives.                                                                         |
| Settlement uses integer units   | Per-bid estimates round down. The final unsettled claim also receives accumulated public-vault remainders, so its transfer can be larger and depends on claim order. |
| 1% of tokens is withheld        | Finalization removes 1% of gross auction supply from aggregate public claims. Quote-refund calculations are not adjusted for it.                                     |

A bid that remains at or above clearing cannot be withdrawn. It stays in escrow until finalization and claim. A priced-out bid can be cancelled for a full refund or left for the post-finalization claim path.

An ordinary winning claim has a deterministic minimum equal to 99% of the allocation the clearing rules assign, rounded down, because finalization withholds the permanent reserve. The quote amount committed is unchanged, so its effective price is about 1.01 times the clearing price. The final unsettled claimant can receive additional token and quote rounding remainder from the public vaults. Treat any pre-finalization estimate as a floor subject to that order-dependent final sweep.

[See exact bid outcomes](bid-outcomes.md)

## Finalization and claims

Reaching the auction end time stops bidding, but does not itself execute finalization. A successful finalization transaction must create the Treasury AMM and freeze the shared settlement outcome before claims open.

Anyone can submit finalization. Until one succeeds:

- bidder tokens and refunds remain in auction escrow;
- creator auction fees are not claimable;
- the post-auction market is not active.

Claims are not sent automatically. Each bidder and creator submits their own claim transaction. Assets remain in program-controlled vaults until the corresponding claim succeeds.

## Swap execution

A swap quote describes one observed market state. Other confirmed swaps can change that state before your transaction executes.

Treasury AMM swap instructions support a minimum output and a deadline. The transaction fails if the calculated output is below the minimum or the deadline has passed. These controls limit execution conditions; they do not reserve a quote.

Trade size matters:

- larger trades generally have greater price impact;
- a buy cannot remove the market's final retained inventory;
- a trade can fail when inventory, reserves, or output are insufficient;
- very small trades can fail when integer rounding leaves no executable output;
- swap fees and rounding affect the amount received.

[See fee calculations](fees.md)

## Reserve Value

Reserve Value is an on-chain accounting measure. Using displayed whole-token amounts:

```text
Reserve Value = backing / circulating supply
```

The on-chain calculation uses integer base units and the ticker token's decimal scale. Reserve Value is not a guaranteed market price or fee-free redemption quote. A seller's result follows the Treasury AMM curve and includes price impact, fees, and integer rounding.

Swaps preserve or increase the protocol's underlying integer Reserve Value, but the displayed value can remain unchanged at the visible precision.

The Treasury AMM's accounting defines a complete-redemption state in which circulation, backing, liquidity, and Reserve Value all reach zero. FUTA markets cannot reach it: the permanent reserve is circulating supply that can never be sold, so circulation always stays above zero.

[Understand reserve backing](../concepts/reserve-backing.md)

## Ticker identity

Ticker uniqueness is scoped to FUTA. A FUTA ticker points to one mint and market inside the protocol, but the same symbol can identify unrelated assets elsewhere.

Verify the token mint rather than relying on a symbol alone. The protocol has no production instruction that releases a successfully claimed ticker for reuse.

## Wallet and network dependencies

FUTA cannot recover access to a wallet or reverse a transaction that the wallet signs and Solana confirms. Keep wallet recovery material private and review every requested signature.

Transactions also depend on Solana, wallet software, RPC services, and the SPL Token program. Service interruption or stale data can delay submission, confirmation, finalization, claims, or swaps even when the protocol state remains valid.

The interface can summarize account state, but Solana accounts are authoritative. Confirm the final transaction result before treating a bid, claim, launch, or trade as complete.

### Embedded wallets

An embedded wallet created by signing in with email, Google, or Apple is held by FUTA's wallet provider, Privy, rather than by wallet software you installed. The following apply to it in addition to everything above:

| Limitation                       | Effect                                                                                                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No per-transaction wallet prompt | The wallet signs without opening an approval screen of its own. FUTA's own confirmation before a claim or finalization, and the amounts shown on the bid and trade forms, are the review step. |
| Access follows the login         | Whoever controls the email, Google, or Apple account can reach the wallet. Losing that account means losing the wallet.                                                                        |
| No export or recovery screen     | FUTA does not offer key export, passkey or multi-factor setup, account linking, or recovery management for the embedded wallet.                                                                |
| Session persists in the browser  | The login survives closing the tab, and a new tab reconnects the wallet automatically until you disconnect. Disconnect before leaving a shared or public device.                               |
| Provider dependency              | Sign-in, signing, and card funding depend on the wallet provider's service in addition to Solana and RPC services.                                                                             |

Card purchases are handled by third-party payment providers. Their fees, minimums, identity checks, and country availability are outside the protocol, and FUTA cannot reverse or refund one.

[Connect a wallet](../guides/connect-a-wallet.md) compares the two connection options.

## Creator limitations

Launching a ticker creates its mint, claims the FUTA ticker, opens the auction, and escrows the creator's opening bid in one transaction.

Creators should account for these constraints:

- the ticker remains assigned after a successful launch;
- the opening bid follows the same clearing and claim mechanics as other bids, including the permanent-reserve withholding;
- configured auction fee rates and market fee shares determine creator accrual; they do not guarantee revenue;
- creator fees accrue only when the corresponding fee-producing activity occurs;
- creator fees are controlled by a transferable fee-right NFT rather than by the creator's address, so transferring or losing that NFT transfers or loses the right to claim them.

## Parameters and protocol dependencies

Auction configuration is snapshotted when an auction launches. Market liquidity allocation and fee-recipient shares are snapshotted when finalization creates the Treasury AMM. Later global configuration changes apply to future auctions or markets rather than rewriting existing ones. The fixed 1% swap fee is a protocol constant, not a market snapshot.

Always use the parameters shown for the specific auction or market. [See protocol parameters](protocol-parameters.md).
