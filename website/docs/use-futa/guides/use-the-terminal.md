# Use the terminal and shortcuts

FUTA exposes the same actions through a typed terminal and keyboard shortcuts. They are alternative entry points, not a separate protocol path: every transaction they build is the transaction the ordinary interface builds, and it is approved the same way — in your wallet, or through FUTA's own confirmation for an embedded wallet.

## Run a terminal command

The terminal panel sits alongside the auction list on **AUCTIONS**.

1. Open **AUCTIONS**.
2. Select the terminal input.
3. Type `help` and press Enter to see the featured commands, or `help commands` for the full list.

A command that needs arguments you did not supply will prompt for them one at a time, so `bid` on its own is as valid as a complete line. Commands that act on assets stop for a `(Y/n)` confirmation before they build a transaction.

## Commands

| Command                                           | What it does                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| `help`, `help commands`                           | List featured commands, then every command                            |
| `help searches`                                   | List example natural-language searches                                |
| `info`                                            | Show the protocol overview: live auctions, pools, TVL, 24h volume     |
| `clear`                                           | Clear the terminal output                                             |
| `connect`, `disconnect`                           | Connect or disconnect your wallet. `sign in` and `sign out` also work |
| `cd [ticker]`                                     | Switch the page to that ticker's auction                              |
| `account`                                         | Summarize the connected wallet's bids, holdings, and fee rights       |
| `status [ticker]`                                 | Show live bid status, for one ticker or across all of them            |
| `create [ticker]`                                 | Launch a ticker                                                       |
| `bid [ticker] [amount] [N]`                       | Place a bid                                                           |
| `edit [ticker] …`                                 | Edit an existing bid                                                  |
| `cancel [ticker]`                                 | Cancel a priced-out bid                                               |
| `claim [ticker]`                                  | Claim bid outcomes and creator-fee work for one ticker                |
| `claim all`                                       | Claim available bid outcomes and creator fees across all tickers      |
| `claim fees`                                      | Finalize, initialize, and claim eligible creator-fee work             |
| `watchlist`                                       | List the auctions on your watchlist, soonest to close first           |
| `watch [ticker]`                                  | Add an auction to your watchlist, then show it                        |
| `unwatch [ticker]`                                | Remove an auction from your watchlist, then show it                   |
| `watchlist clean`, `clean watchlist`              | Drop every closed auction from your watchlist                         |
| `watchlist reset`, `reset watchlist`              | Empty your watchlist, after a confirmation                            |
| `find "<query>"`, `search`                        | Search auctions in plain language                                     |
| `swap [ticker] [buy\|sell] [amount]`              | Trade a finalized ticker                                              |
| `buy [ticker] [amount]`, `sell [ticker] [amount]` | Trade in one explicit direction                                       |
| `sell all`                                        | Sell every sellable FUTA token in your wallet                         |

In `bid` and `edit`, the amount is in the quote token and `N` is the numbered **MAX MARKET CAP** level. The prompt lists the valid level numbers for that auction; `level N` selects one. See [Place a bid](place-a-bid.md) for what the limit means.

`watch` and `unwatch` take effect immediately — there is no confirmation, because each is the other's undo and neither builds a transaction. `watch` needs a ticker that names a real auction, open or closed; `unwatch` needs one that is on your watchlist, so an entry whose auction has since disappeared can still be removed. Both print your updated watchlist. The eye button on an auction does the same thing, and the list persists across sessions in this browser.

`watchlist clean` removes every auction your watchlist shows as `CLOSED`, and prints what is left. It leaves alone any entry the terminal could not match to an auction at all — those show as dashes rather than `CLOSED`, and an auction can be missing simply because its data has not loaded yet. When there is something to clear, the watchlist ends with a line offering it; select that line to run it. With nothing closed on the list, the command reports that rather than doing anything.

`watchlist reset` empties the watchlist entirely, and is the one watchlist command that stops for a `(Y/n)` confirmation: it removes auctions that are still running as well as ones that have closed, and nothing restores them. The prompt names how many tickers it would remove; answer `Y` or press Enter to go ahead, `n` or Escape to call it off. On a watchlist that is already empty it reports that instead of asking.

`claim <ticker>` and `claim all` cover both auction outcomes and creator-fee work; `claim fees` limits the scope to creator fees. The terminal orders everything needed to unlock a fee claim: it can finalize an ended auction, initialize an eligible fee-right NFT, and then claim accrued fees. Each stage is a separate transaction with its own confirmation. The **CLAIM ALL** buttons under **ACCOUNT** → **BIDS** and **FEES** remain narrower: each acts only on that panel, and the fee-panel button does not initialize missing rights. See [Claim creator fees](claim-creator-fees.md).

## Search in plain language

`find` accepts descriptive queries rather than exact filters. Examples the terminal suggests include:

```text
find "auctions closing soon"
find "almost filled"
find "market cap over 100k"
find "newest auctions"
find "least filled auctions"
```

## Keyboard shortcuts

Press **Shift + ?** to open the shortcut overlay. The defaults are:

| Shortcut  | Action            |
| --------- | ----------------- |
| Shift + ? | Display shortcuts |
| Shift + A | Go to auctions    |
| Shift + T | Go to trade       |
| Shift + C | Go to create      |
| Shift + P | Go to account     |

Every shortcut in the overlay can be rebound. Assigning a combination already
held by another shortcut unbinds that other shortcut rather than creating a
conflict.

The overlay also carries a switch that turns the four navigation shortcuts on or
off as a group, without disturbing their assignments. You can reach the same
overlay from **ACCOUNT** → **SETTINGS** by finding **Hotkeys** and selecting
**Configure**; that settings panel also holds the animation and
dyslexia-friendly font toggles.

## What these entry points do not change

The terminal and the shortcuts read the same on-chain state and submit the same instructions as the buttons. They do not bypass finalization, they cannot claim before an auction is finalized, and they do not hold a signing key. Every rule in [Bid outcomes](../reference/bid-outcomes.md) and [Risks and limitations](../reference/risks-and-limitations.md) applies unchanged.
