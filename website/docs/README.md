# FUTA

FUTA is a Solana protocol for launching ticker markets, discovering their opening price through an auction, and continuing trade in a treasury-backed market.

One ticker points to one market. Anyone can launch a ticker, anyone can bid in its auction, and anyone can trade it afterward.

## How a ticker market works

1. **Launch.** The creator claims an available ticker and commits an opening bid. FUTA creates the token, mints its fixed supply into protocol custody, and opens the auction in one operation.
2. **Price discovery.** The auction runs for a fixed period. Demand moves a single clearing level upward, and every winning bid settles at that same final price.
3. **Finalization.** After the auction ends, anyone can finalize it. Finalization fixes the outcome, withholds a permanent reserve, moves the remaining inventory and proceeds into a Treasury AMM, and opens claims.
4. **Market.** The Treasury AMM becomes the ticker's continuing market, holding unsold inventory against reserve backing and active liquidity.

[Read the full lifecycle](use-futa/concepts/ticker-markets.md)

## Start here

New to FUTA? Take the read-only tour of a live auction and a finalized market. It teaches the whole lifecycle without a wallet or a transaction.

[Start here](use-futa/start-here.md){ .md-button .md-button--primary }

## Use FUTA

[Use FUTA](use-futa/README.md) covers the app: connecting or creating a wallet, finding and following markets, bidding, claiming, launching, trading, and claiming creator fees.

- [Guides](use-futa/guides/README.md) — step-by-step instructions for each task
- [Concepts](use-futa/concepts/README.md) — auctions, the Treasury AMM, and reserve backing
- [Reference](use-futa/reference/README.md) — auction states, bid outcomes, fees, parameters, and risks

## Build with FUTA

[Build with FUTA](build-with-futa/README.md) covers how the protocol is constructed: its Solana programs, account model, settlement, and the TypeScript SDK.

- [Concepts](build-with-futa/concepts/README.md) — protocol architecture, settlement, and TAMM accounting
- [Reference](build-with-futa/reference/README.md) — program IDs, accounts, instructions, events, errors, and the SDK
