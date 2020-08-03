import { SBanken } from '@sherex/sbanken'
import * as config from './lib/load-config'
import { FireflyClient, TransactionCreate } from './lib/firefly'

const sbanken = new SBanken(config.sbanken)
const firefly = new FireflyClient({
  baseUrl: config.firefly.baseUrl,
  token: config.firefly.token
})
const accountsToSync = config.settings.accounts.split(',')

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
  const existingAccounts = await firefly.getAccounts()
  const existingNumbers = existingAccounts.map(account => account.attributes.account_number)

  for await (const account of accounts) {
    if (typeof account.accountNumber !== 'string' || !accountsToSync.includes(account.accountNumber)) return
    if (existingNumbers.includes(account.accountNumber)) return
    if (typeof account.name !== 'string') return
    if (typeof account.accountNumber !== 'string') return
    if (typeof account.balance !== 'string') return

    try {
      await firefly.createAccount({
        name: account.name,
        type: 'asset',
        account_number: account.accountNumber,
        current_balance: account.balance,
        account_role: 'defaultAsset',
        currency_code: 'NOK'
      })
      console.log(`Account "${account.name}" created!`)
    } catch (error) {
      console.log(`Couldn't create account "${account.name}"! Skipping..`)
      return
    }

    if (typeof account.accountId !== 'string') return
    const transactions = await sbanken.getTransactions(account.accountId, { length: '3' })
    const formattedTransactions = transactions.map((transaction): TransactionCreate => ({
      // TODO: Use convert-transaction
    }))
    console.log(formattedTransactions)
  }
})().catch(error => {
  console.error(error.response.data)
})
