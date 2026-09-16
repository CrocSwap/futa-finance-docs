# Fund an embedded wallet

An embedded wallet created by signing in with email, Google, or Apple starts empty. Add quote tokens (USDC) for bids and trades, and SOL for network fees and account rent, before your first transaction.

A wallet you already held is funded the way you normally fund it; this guide covers the **FUND YOUR WALLET** window only.

## Open the funding window

It opens automatically the first time a new embedded wallet connects. To reopen it:

1. Select your wallet address in the header.
2. Select **DEPOSIT**.

The window lists your live USDC and SOL balances and updates while it is open, so you can watch a transfer arrive without closing it.

## Buy with a card

Select **BUY USDC** or **BUY SOL** to purchase through the wallet provider's onramp. Buy both: USDC covers the bid or trade, and SOL covers network fees.

The purchase runs in the provider's own screens. FUTA reports whether the purchase was submitted or confirmed; the balance updates when the funds arrive on Solana, which can lag the confirmation.

Card purchases are available only on the mainnet deployment. On a test-network build the buttons are disabled and state why, so a test session cannot start a real-money purchase.

Purchase minimums, fees, payment methods, identity checks, and country availability are set by the payment provider, not by FUTA.

## Transfer from another wallet

In the **Or transfer from another wallet** section, the window shows your embedded wallet's address as text and as a QR code. Select **COPY** to copy it, or read it off the screen if your browser blocks clipboard access.

Send only on the Solana network. Assets sent from another chain, or on a bridged representation of USDC, are not recoverable.

Send SOL as well as USDC. A wallet holding only USDC cannot pay the fees to spend it.

## When you are funded

The window confirms that funds were received once both balances are positive. Select **DONE** to close it.

If a bid or trade is rejected for insufficient funds afterwards, check the SOL balance first — the wallet dropdown warns when SOL is too low to cover network fees.

FUTA cannot reverse a transfer, recover assets sent to the wrong address or network, or refund a card purchase. [See risks and limitations](../reference/risks-and-limitations.md).
