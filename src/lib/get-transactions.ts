import { SBanken, Transaction } from '@sherex/sbanken'
import { subtractYears, getISODate } from './tools'

export async function getAllTransactions (sbanken: SBanken, accountId: string): Promise<Transaction[]> {
  const transactions: Transaction[] = []
  const pageSize = 1000
  let currentIndex = 0
  let endDate = new Date()
  let startDate = subtractYears(endDate, 1)
  while (true) {
    console.log(`#### Getting index: ${currentIndex}`)
    console.log(`Start date: ${getISODate(startDate)}`)
    console.log(`End date:   ${getISODate(endDate)}`)
    const page = await sbanken.getTransactions(accountId, {
      startDate: getISODate(startDate),
      endDate: getISODate(endDate),
      length: String(pageSize),
      index: String(currentIndex)
    })

    console.log(`Transactions on page: ${page.length}`)
    transactions.push(...page)

    currentIndex += page.length
    if (page.length === 0) break
    if (page.length < pageSize) {
      currentIndex = 0
      endDate = subtractYears(endDate, 1)
      startDate = subtractYears(startDate, 1)
    }
  }
  return transactions
}
