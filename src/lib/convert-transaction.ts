import { Transaction } from '@sherex/sbanken'
import { TransactionCreate } from '../types'

export function convertTransaction (sbankenTransaction: Transaction, accountId: number): TransactionCreate | null {
  if (typeof sbankenTransaction.accountingDate !== 'string') return null
  if (typeof sbankenTransaction.text !== 'string') return null
  if (typeof sbankenTransaction.amount !== 'number') return null

  const transaction: TransactionCreate['transactions'][0] = {
    type: sbankenTransaction.amount < 0 ? 'withdrawal' : 'deposit', // TODO: Check if transfer
    date: sbankenTransaction.accountingDate,
    description: sbankenTransaction.text,
    source_id: accountId,
    destination_name: sbankenTransaction.text,
    destination_id: null,
    amount: sbankenTransaction.amount.toString().replace(/[+-]/, '')
  }

  // TODO: Fix
  if (typeof sbankenTransaction.cardDetails?.merchantName === 'string') {
    transaction.destination_name = sbankenTransaction.cardDetails.merchantName
  } else if (sbankenTransaction.transactionTypeText === 'StraksOvf') {
    console.log(sbankenTransaction.text.replace(/Til: /i, 'Vipps til: '))
    transaction.destination_name = sbankenTransaction.text.replace(/Til: /i, 'Vipps til: ')
  } else {
    transaction.destination_name = textToDestAccount(sbankenTransaction.text)
  }

  return {
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
