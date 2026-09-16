# Errors

FUTA instructions can return program-specific custom errors and standard Solana runtime or SPL Token errors. Decode custom codes using the program that produced them; the same number in another program has a different meaning.

## Auction-program errors

The auction program uses Anchor custom-error codes beginning at `6000`.

| Code | Name                           | Meaning                                                                            |
| ---: | ------------------------------ | ---------------------------------------------------------------------------------- |
| 6000 | `InvalidTickerChars`           | Ticker contains characters other than uppercase A–Z or digits 0–9                  |
| 6001 | `TickerAlreadyUsed`            | Ticker is already registered                                                       |
| 6002 | `TickerBlacklisted`            | Ticker is blocked from launch                                                      |
| 6003 | `TickerTooLong`                | Ticker exceeds the configured maximum                                              |
| 6004 | `TickerTooShort`               | Ticker is below the configured minimum                                             |
| 6005 | `InvalidTickerLen`             | Configured ticker bounds are invalid                                               |
| 6006 | `TickerEmpty`                  | Ticker is empty                                                                    |
| 6007 | `TickerLimitReached`           | The active ticker launch counter is exhausted                                      |
| 6008 | `ProtocolNotConfigured`        | Required launch configuration is incomplete                                        |
| 6009 | `InvalidSupplyConfig`          | Total and auction supply do not satisfy launch constraints                         |
| 6010 | `InvalidStepSize`              | Auction step size is zero                                                          |
| 6011 | `InvalidDecimals`              | Configured token decimals exceed nine                                              |
| 6012 | `AuctionAlreadyExists`         | An auction already exists for the mint                                             |
| 6013 | `AuctionNotEnded`              | The requested operation requires auction end or an active auction condition failed |
| 6014 | `AuctionAlreadyFinalized`      | Finalization has already completed                                                 |
| 6015 | `ZeroBidSize`                  | Bid or bid increase is zero                                                        |
| 6016 | `BidLevelTooLow`               | Bid limit does not satisfy live clearing rules                                     |
| 6017 | `BidLevelMisaligned`           | Bid limit is not aligned to the auction step size                                  |
| 6018 | `CreatorBidTooSmall`           | Creator bid does not meet the reserve-price auction cap                            |
| 6019 | `BidAlreadySettled`            | Bid was already claimed or cancelled                                               |
| 6020 | `ArithmeticOverflow`           | Checked integer arithmetic failed                                                  |
| 6021 | `LevelOutOfRange`              | Price level is outside the supported math or bucket range                          |
| 6022 | `VaultNotEmpty`                | A vault cannot close while it holds tokens                                         |
| 6023 | `Unauthorized`                 | Signer is not the protocol authority                                               |
| 6024 | `InvalidQuoteMint`             | Quote mint does not match auction state                                            |
| 6025 | `InvalidMint`                  | Supply mint or mint-linked account does not match                                  |
| 6026 | `InvalidSessionUser`           | Signer does not match the supplied `user` account                                  |
| 6027 | `SessionRequiresProgramSigner` | Transfer path requires the optional `program_signer` account                       |
| 6028 | `MetadataUriTooLong`           | Metadata base URI exceeds 96 bytes                                                 |
| 6029 | `AuctionNotFinalized`          | Operation requires completed finalization                                          |
| 6030 | `InvalidLiquidityConfig`       | Liquidity allocation, fee rate, fee shares, or initial market state is invalid     |
| 6031 | `NoLiquidityReserves`          | Finalization produced no quote reserves for the market                             |
| 6032 | `InvalidAmmProgram`            | Treasury AMM program or PDA does not match                                         |
| 6033 | `CreatorFeesAlreadyClaimed`    | Auction creator fee was already claimed                                            |
| 6034 | `NoCreatorFees`                | Auction has no positive creator fee to claim                                       |
| 6035 | `NotCreator`                   | Signer is not the auction creator                                                  |
| 6036 | `MetadataUriNotConfigured`     | Metadata base URI is required but has not been set                                 |
| 6037 | `UnsupportedFeeRightVersion`   | Creator fee-right or pool-liquidity layout version is not supported                |
| 6038 | `InvalidFeeRight`              | Creator fee-right account, mint, or launch relationship does not match             |
| 6039 | `InvalidFeeRightTokenAccount`  | Signer does not hold the one unit of the fee-right mint                            |
| 6040 | `InvalidFeeRightMetadata`      | Creator fee-right metadata or master-edition account is invalid                    |
| 6041 | `InvalidQuoteVault`            | Auction quote vault does not match auction state                                   |
| 6042 | `InvalidPermanentReserve`      | Permanent reserve is zero, or is not smaller than the gross auction allocation     |
| 6043 | `TooManyBids`                  | Auction cannot accept more outstanding bids                                        |
| 6044 | `InvalidBidSettlement`         | Unsettled bid accounting is inconsistent                                           |

Some constraints reuse a broad error. For example, `AuctionNotEnded` can also result when an instruction expects an active auction, and `InvalidMint` can report a mismatched mint-derived PDA.

## Treasury AMM errors

Treasury AMM error codes are zero-based enum indexes.

| Code | Name                        | Meaning                                                        |
| ---: | --------------------------- | -------------------------------------------------------------- |
|    0 | `InvalidInstruction`        | Arguments or initialization inputs are invalid                 |
|    1 | `InvalidMintDecimals`       | A mint's decimal scale cannot be represented                   |
|    2 | `InvalidMintAuthority`      | Market mint still has a mint or freeze authority               |
|    3 | `UninitializedAccount`      | Required account is not initialized                            |
|    4 | `AlreadyInitialized`        | Pool has already been initialized                              |
|    5 | `InvalidAuthority`          | Market-authority PDA or authorized recipient is invalid        |
|    6 | `InvalidMint`               | Mint account or mint relationship is invalid                   |
|    7 | `InvalidTokenAccount`       | Vault or user token account is invalid                         |
|    8 | `InsufficientFunds`         | Required quote reserves or account balance is insufficient     |
|    9 | `MathOverflow`              | Checked arithmetic, division, or representability failed       |
|   10 | `SlippageExceeded`          | Computed output is below the caller's minimum                  |
|   11 | `TradeTooSmall`             | Input is zero or cannot produce a valid trade                  |
|   12 | `InsufficientInventory`     | Buy would exceed available market inventory                    |
|   13 | `InvalidFeeSplit`           | Treasury, protocol, or creator fee shares are invalid          |
|   14 | `InvalidPoolState`          | Pool data, discriminator, PDA, or invariant state is invalid   |
|   15 | `DeadlineExceeded`          | Current Unix time is later than the positive deadline          |
|   16 | `InvalidSwapDirection`      | Unified swap source mint is neither pool mint                  |
|   17 | `LegacyInitializerDisabled` | Instruction tag 0 pool initialization is permanently disabled  |
|   18 | `UnauthorizedInitializer`   | Pool initialization was not signed by the FUTA initializer PDA |

Malformed Treasury AMM instruction bytes return Solana's `InvalidInstructionData` rather than custom code `0`.

Codes `17` and `18` both mean the caller tried to create a pool outside auction finalization. Pools can only be created by the auction program's finalization CPI; there is no permissionless pool-creation path.

## Common non-custom failures

| Failure                          | Typical cause                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `MissingRequiredSignature`       | User, payer, authority, or fee recipient did not sign                                            |
| `IncorrectProgramId`             | Supplied system, token, pool, or account owner program is wrong                                  |
| `NotEnoughAccountKeys`           | Raw instruction omitted a required account                                                       |
| SPL Token owner or balance error | Source authority, vault authority, mint, or token balance is wrong                               |
| Anchor constraint error          | PDA, address, mutability, signer, owner, or account relationship does not match the IDL contract |

Client applications should surface the program name, custom error name, and transaction signature. Do not map all arithmetic or account-validation errors to slippage; they require different remediation.
