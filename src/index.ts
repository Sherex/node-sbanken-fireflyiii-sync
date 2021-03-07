import { SBanken, Transaction } from '@sherex/sbanken'
import * as config from './lib/load-config'
import { getAllTransactions } from './lib/get-transactions'
import { FireflyClient, TransactionCreate } from './lib/firefly'
import { convertTransaction } from './lib/convert-transaction'

const sbanken = new SBanken(config.sbanken)
const firefly = new FireflyClient({
  baseUrl: config.firefly.baseUrl,
  token: config.firefly.token
})
const accountsToSync = config.settings.accounts

const shouldSyncAccount = (accountNumber: string): boolean => accountsToSync.length > 0 && accountsToSync.includes(accountNumber)

;(async () => {
  const currency = await firefly.getCurrency('NOK')
  if (currency === null && config.settings.createCurrency === 'true') {
    try {
      await firefly.createCurrency({
        code: 'NOK',
        name: 'Norwegian Kroner',
        symbol: 'kr'
      })
      console.log('Created currency "NOK"')
    } catch (error) {
      console.log('Failed to create currency "NOK"! Throwing..')
      throw error
    }
  } else if (currency?.attributes.enabled === false) {
    console.log('Currency "NOK" is disabled, please enable it manually. Exiting...')
    process.exit(0)
  }

  const accounts = await sbanken.getAccounts()
  const existingAccounts = await firefly.getAccounts() // TODO: Paging on more than 50 accounts
  const existingNumbers = existingAccounts.map(account => account.attributes.account_number)

  console.log(`SBanken accounts: ${accounts.length}\nFirefly accounts: ${existingAccounts.length}\nExisting accounts: ${existingNumbers.length}\n`)

  for await (const account of accounts) {
    // console.log(account)
    if (typeof account.accountNumber !== 'string' || !shouldSyncAccount(account.accountNumber)) return
    if (typeof account.accountId !== 'string') return

    const transactions: Transaction[] = await getAllTransactions(sbanken, account.accountId)

    if (!existingNumbers.includes(account.accountNumber)) {
      try {
        if (typeof account.name !== 'string') return
        if (typeof account.accountNumber !== 'string') return

        const firstTransaction = transactions[transactions.length - 1]
        const openingDate = firstTransaction.accountingDate

        console.log(`Creating account: ${account.name} - ${openingDate ?? 'unknown date'}`)
        const createdAccount = await firefly.createAccount({
          name: account.name,
          type: 'asset',
          account_number: account.accountNumber,
          opening_balance: 0,
          opening_balance_date: openingDate,
          account_role: 'defaultAsset',
          currency_code: 'NOK'
        })
        console.log(`Account "${createdAccount.attributes.name}" created!`)
      } catch (error) {
        console.error(error.response.data)
        console.log(`Couldn't create account "${account.name ?? 'unknown'}"! Skipping..`)
      }
    }

    const fireflyAccount = (await firefly.getAccounts()).find(ffAccount => ffAccount.attributes.account_number === account.accountNumber)
    if (fireflyAccount === undefined) throw new Error('Couldn\'t find Firefly account')

    const formattedTransactions = transactions
      .map(transaction => convertTransaction(transaction, parseInt(fireflyAccount.id)))
      .filter(transaction => transaction !== null) as TransactionCreate[]

    let index = 0
    for (const formattedTransaction of formattedTransactions) {
      try {
        if (index % 50 === 0) console.log(`Creating transaction ${index} at "${formattedTransaction.transactions[0].date}"`)
        await firefly.createTransaction(formattedTransaction)
      } catch (error) {
        console.log(`Failed to create transaction: ${formattedTransaction.transactions[0].description}`)
        // console.log(formattedTransaction.transactions[0])
        // console.log('#### Error:')
        // console.log(error)
      } finally {
        index++
      }
    }
    console.log(`\nDone! Created ${index} transactions`)
  }
})().catch(error => {
  if (typeof error.response?.data !== 'undefined') console.error(error.response.data)
  else console.error(error)
})
