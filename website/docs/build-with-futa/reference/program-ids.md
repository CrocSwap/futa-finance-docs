# Program IDs

FUTA deploys the same program IDs on every cluster. A client selects a network by its RPC endpoint and quote mint, not by a different address.

| Program                  | Address                                        |
| ------------------------ | ---------------------------------------------- |
| Auction program (`futa`) | `7niSfgKp9rM5PUdkEsZEaHhYsaoXRb33UaHrmbkR3sJu` |
| Treasury AMM             | `ChhrKC6mGkFtYzh6SftDSn5YdxyXkXCB7Zd88G51b9wZ` |

Two more addresses appear in FUTA derivations and account contracts:

| Program                 | Address                                       | Used for                                                                         |
| ----------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| SPL Token               | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | Mints, vaults, and every token transfer                                          |
| Metaplex Token Metadata | `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s` | Metadata and master-edition accounts for launch mints and creator fee-right NFTs |

The permanent reserve authority is derived under Solana's System Program, `11111111111111111111111111111111`. See [Accounts](accounts.md) for the seeds.

## Quote mint

The quote mint is protocol configuration, not a constant. Read `ProtocolConfig.quote_mint` for what new auctions will use, and `AuctionState.quote_mint` for what an existing auction actually uses; the two can differ once the protocol authority changes the default. Mainnet launches use USDC, `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`.

## Related program

A concentrated-liquidity program, `b7QhwoZNptZp1PHURthEVvq65RVaoWjNweQd9ACUKir`, is deployed alongside FUTA and is exposed by the SDK. It is not on the ticker-market path: finalization creates a Treasury AMM pool, and the `set_clmm_params` fields on `ProtocolConfig` are not read by that path. Do not route ticker trades through it.

See [Accounts](accounts.md) for PDA derivation and [SDK](sdk.md) for helpers that carry these addresses.
