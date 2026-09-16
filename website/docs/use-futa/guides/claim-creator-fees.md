# Claim creator fees

Claim the auction and market fees that have accrued to the tickers whose creator fee rights you hold.

## How creator fees are controlled

Each finalized launch has one creator fee right: a transferable one-of-one NFT that controls both the launch's unclaimed auction creator fee and its unclaimed and future market creator fees.

Holding that NFT is what authorizes a claim. The launch creator receives it, but it is an ordinary SPL token, so the right moves with it. If you transfer or sell the NFT, you transfer the ability to claim, including fees that had already accrued but were never claimed. Claim anything you want to keep before you transfer it.

Auction creator fees become available once, after finalization. Market creator fees accrue in quote tokens as fee-producing trades occur and can be claimed again as more accumulate. A single claim collects both.

## Before you begin

Connect the wallet that holds the fee right and keep enough SOL available for the transactions.

## Initialize a fee right

A launch's fee right does not exist until someone creates it. This is a one-time transaction per launch, separate from finalization.

1. Open **ACCOUNT**, then **FEES**.
2. Look for the **READY TO INITIALIZE** section. It appears only when a launch is eligible and its fee right has not been created yet.
3. Find the ticker and select **INITIALIZE**.
4. Review and approve the transaction when prompted.
5. Wait for confirmation. The ticker then moves into **OWNED FEE RIGHTS**.

The NFT is always minted to the wallet recorded as the launch creator, whoever pays for the transaction. Until a fee right is initialized, that launch's creator fees cannot be claimed by anyone.

Launches finalized before creator fee rights were introduced are not eligible and will not appear in this section.

## Claim fees for one ticker

1. Open **ACCOUNT**, then **FEES**.
2. Find the ticker under **OWNED FEE RIGHTS**. The **AUCTION** and **TAMM** columns show each fee source separately, and **TOTAL** shows what one claim would collect.
3. Select **CLAIM**.
4. Review and approve the requested transaction when prompted.
5. Wait for confirmation before treating the quote tokens as received.

The claim collects the auction fee and the accrued market fees together and sends them to the wallet holding the fee right.

## Claim across tickers

Select **CLAIM ALL** to collect the available fees across every fee right you hold. The claim may require more than one transaction. Follow the wallet prompts and wait for the results to refresh.

Confirmed claims remain complete if a later transaction fails. Reopen **FEES** and retry any amount that still appears.

**CLAIM ALL** only claims. It does not initialize fee rights, so initialize anything under **READY TO INITIALIZE** first if you want its fees included.

When nothing is available, the panel says so instead of offering a claim.

## Keeping records

Select **EXPORT CSV** to download the fee rights shown, along with their claimable amounts.

The auction creator fee rate and market creator fee share determine accrual; they do not guarantee that a ticker will produce fees.

[See how auction and market fees are calculated](../reference/fees.md).
