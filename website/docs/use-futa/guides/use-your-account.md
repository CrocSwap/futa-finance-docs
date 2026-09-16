# Use your account

The **ACCOUNT** page combines one wallet's FUTA activity, balances, launches, fee rights, and local interface settings.

## Open your wallet or another address

Connect a wallet to open your own account. Either connection option — an existing Solana wallet or an embedded wallet created by signing in with email, Google, or Apple — opens the same account view for its address. [Connect a wallet](connect-a-wallet.md). To inspect another wallet without connecting as it, open **SUMMARY**, select the wallet-lookup search control beside the displayed address, and enter a Solana address.

A looked-up account is read-only. You can inspect its public state, but transaction actions remain tied to the connected wallet. You can save and name addresses in the browser for faster return visits; those labels and saved-wallet entries are local and are not written to Solana.

## Account sections

| Section      | What it shows                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| **SUMMARY**  | Quote-token balance, active and historical bid totals, holdings, claimable value, created markets, and fees |
| **BIDS**     | Active, claimable, refunded, and locally remembered claimed bids                                            |
| **TOKENS**   | FUTA token balances, current estimated sell value, and any claimable auction tokens                         |
| **CREATED**  | Tickers launched by the wallet, with auction and current pool market caps                                   |
| **FEES**     | Creator fee-right NFTs, claimable auction and market fees, and fee rights ready to initialize               |
| **SETTINGS** | Animations, dyslexia-friendly font, and hotkey preferences                                                  |

Claimed bid records close on-chain. To keep useful history after that account disappears, FUTA remembers claims made through this browser. Historical totals can therefore differ on another browser or device.

## Search, sort, and export

The data tables can be searched by ticker or mint and sorted from their column headings. Use **SHOW INACTIVE** under **BIDS** when you need completed or claimed records.

The **BIDS**, **TOKENS**, **CREATED**, and **FEES** sections offer **EXPORT CSV** for the rows represented by that account view. Exports are local downloads; FUTA does not upload them.

## Act from the account

Use **CLAIM** on a bid or claimable token row, or **CLAIM ALL** to process several auction outcomes. The claim window shows whether finalization can be combined with a claim or needs a separate transaction and previews the estimated SOL cost or rent refund when simulation is available.

Use **TRADE** from a held token row to open its market. Under **FEES**, initialize eligible creator fee rights and claim their accrued fees. These controls are unavailable in read-only wallet lookup mode.

See [Claim an auction outcome](claim-an-auction-outcome.md) and [Claim creator fees](claim-creator-fees.md) for the transaction flows.

## The wallet dropdown

Selecting your wallet address in the header shows the connected wallet's address, its quote-token and SOL balances, and a warning when SOL is too low to cover network fees.

For an embedded wallet it also shows which login the session is signed in with, and a **DEPOSIT** action that reopens the funding window. [Fund an embedded wallet](fund-an-embedded-wallet.md).

**DISCONNECT** ends the session. For an embedded wallet that also signs the browser out of the login. [See disconnecting](connect-a-wallet.md#disconnect).

## Local settings

Under **SETTINGS** you can:

- turn **Animations** on or off;
- turn the **Dyslexia-Friendly Font** on or off; and
- select **Configure** under **Hotkeys** to reassign keyboard shortcuts or restore their defaults.

These preferences are stored in the browser. Clearing site data resets them.
