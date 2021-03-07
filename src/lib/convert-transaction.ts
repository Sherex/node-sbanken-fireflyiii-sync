import { Transaction } from '@sherex/sbanken'
import { TransactionCreate } from '../types'

export function convertTransaction (sbankenTransaction: Transaction, accountId: number): TransactionCreate | null {
  if (sbankenTransaction.isReservation === true) return null
  if (typeof sbankenTransaction.accountingDate !== 'string') return null
  if (typeof sbankenTransaction.text !== 'string') return null
  if (typeof sbankenTransaction.amount !== 'number') return null

  const isDeposit = sbankenTransaction.amount > 0

  const transaction: TransactionCreate['transactions'][0] = {
    type: isDeposit ? 'deposit' : 'withdrawal', // TODO: Check if transfer
    date: sbankenTransaction.accountingDate,
    description: sbankenTransaction.text,
    source_id: isDeposit ? null : accountId,
    destination_name: sbankenTransaction.text,
    destination_id: isDeposit ? accountId : null,
    amount: sbankenTransaction.amount.toString().replace(/[+-]/, ''),
    external_id: sbankenTransaction.cardDetails?.transactionId
  }

  // TODO: Fix
  if (typeof sbankenTransaction.cardDetails?.merchantName === 'string') {
    transaction.destination_name = sbankenTransaction.cardDetails.merchantName
  } else if (sbankenTransaction.transactionTypeText === 'StraksOvf') {
    transaction.destination_name = sbankenTransaction.text.replace(/(Til|Fra): /i, 'Vipps: ')
  } else {
    transaction.destination_name = textToDestAccount(sbankenTransaction.text)
  }

  return {
    error_if_duplicate_hash: true,
    transactions: [
      transaction
    ]
  }
}

function textToDestAccount (text: string): string {
  const regexes = [
    /^PAYPAL \*(?<text>.+)/, // Paypal
    /GOOGLE \*(?<text>.+)/ // Google play
  ]
  const results = regexes
    .map(regex => text.match(regex))
    .filter(match => match !== null)
  if (results.length === 0) return text
  if (results[0] === null || typeof results[0].groups?.text !== 'string') return text
  const match = results[0].groups.text

  if (results.length > 1) console.warn(`Multiple regexes matched, using first match "${text}" -> "${match}"`)
  return match
}
