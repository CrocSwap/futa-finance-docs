# Connect a wallet

Connect a Solana wallet to bid, claim, launch a ticker, or trade. You can browse FUTA without connecting.

There are two ways to connect:

| Option                      | Use it when                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **An existing wallet**      | You already hold a Solana wallet and want to keep signing with it                             |
| **Email, Google, or Apple** | You have no Solana wallet. FUTA creates an embedded wallet held by its wallet provider, Privy |

Both options connect the same interface and submit the same transactions. They differ in who holds the keys, how each transaction is approved, and how long the connection survives. [See how they differ](#embedded-and-existing-wallets-compared).

## Before you begin

You need:

- a Solana wallet that can sign transactions, or an email address or Google or Apple account to sign in with;
- the quote tokens (USDC) required for the action you plan to take; and
- SOL for network fees and account rent.

An embedded wallet starts empty. You still need USDC and SOL in it before you can bid, launch, or trade. [Fund an embedded wallet](fund-an-embedded-wallet.md).

## Connect an existing wallet

1. Select **CONNECT WALLET** in the header.
2. Review the Terms of Use and Privacy Policy, then select **I AGREE — CONNECT WALLET**.
3. Choose your wallet from the list.
4. Approve the connection in your wallet.

Your shortened wallet address replaces the connection button when the wallet is connected. Select the address to view your balances or disconnect.

On a phone, open FUTA inside your wallet's browser if the connection screen directs you to do so.

Connecting a wallet does not move assets or submit a transaction. FUTA asks for a separate wallet approval whenever an action requires a transaction.

## Sign in with email, Google, or Apple

The same wallet window offers **Google**, **Apple**, and an email field above the wallet list.

1. Select **CONNECT WALLET** in the header and accept the Terms of Use and Privacy Policy.
2. Select **Google** or **Apple**, or enter your email address and submit it.
3. For email, enter the six-digit code sent to that address. Select **Use a different email** to start over with another address.
4. Wait for FUTA to create your wallet and connect it.

Google and Apple redirect the browser to the provider and back, which reloads FUTA. The connection button reads **CONNECTING…** across the round trip, and a bid size, trade amount, or ticker you had already typed is restored when you return. Nothing is lost if you cancel at the provider; return to FUTA and start again.

The **FUND YOUR WALLET** window opens the first time a new embedded wallet connects. [Fund an embedded wallet](fund-an-embedded-wallet.md) covers buying with a card and transferring from another wallet.

Select your wallet address in the header to see which login the wallet is signed in with, check balances, reopen **DEPOSIT**, or disconnect.

## Embedded and existing wallets compared

|                             | Existing wallet                                        | Embedded wallet                                                                  |
| --------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Keys                        | Held by your wallet software                           | Held by Privy and tied to your login                                             |
| Approving a transaction     | Your wallet prompts you for each signature             | No wallet prompt. FUTA shows its own confirmation before claims and finalization |
| Session                     | Ends when you close the tab; reconnect in each new tab | Persists in the browser; a new tab reconnects automatically until you sign out   |
| Recovery                    | Your wallet's recovery material                        | Access to the email, Google, or Apple account you signed in with                 |
| In-app key backup or export | Not applicable                                         | Not available. FUTA has no key export, passkey, or recovery-management screen    |

Because an embedded wallet does not prompt per signature, review the amount, ticker mint, bid limit, and minimum swap output on FUTA's own screens before confirming. [See risks and limitations](../reference/risks-and-limitations.md).

## Disconnect

1. Select your wallet address in the header.
2. Select **DISCONNECT**.

Disconnecting an existing wallet ends the connection for this tab.

Disconnecting an embedded wallet also signs you out of the login session for this browser. If the sign-out request fails, FUTA disconnects locally and warns you that the login session may still be active — on a shared or public device, reconnect and disconnect again until it succeeds.

Disconnecting does not cancel bids, claims, or trades that Solana has already confirmed.
