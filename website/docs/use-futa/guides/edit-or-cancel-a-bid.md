# Edit or cancel a bid

You can edit an eligible bid while its auction is active. You can cancel it through the interface only after it becomes priced out.

## Edit a bid

1. Open **AUCTIONS** and select the ticker with your existing bid.
2. Change **MAX MARKET CAP**, **BID SIZE**, or both.
3. Select **SUBMIT EDIT**.
4. Review and approve the transaction when prompted.
5. Wait for confirmation before relying on the new bid terms.

The following rules apply:

- You can increase **BID SIZE**, but you cannot reduce it.
- You can move **MAX MARKET CAP** up or down only while the resulting limit remains above the live clearing level.
- The bid must contain a real change before you can submit it.
- Clearing can advance before your transaction executes, causing an otherwise valid edit to fail.

Increasing the bid size transfers the additional quote tokens into escrow. Changing only the limit does not change the amount already escrowed.

## Cancel a priced-out bid

When an active auction shows your bid as **OUT**, the interface makes **CANCEL BID** available.

1. Select **CANCEL BID**.
2. Review and approve the transaction when prompted.
3. Wait for confirmation.

A successful cancellation returns the full bid amount and closes the bid's on-chain record. It also returns the SOL rent held by that record.

You cannot cancel a bid that remains at or above the live clearing level. If the auction has ended, use the [claim flow](claim-an-auction-outcome.md) to collect any refund after finalization.
