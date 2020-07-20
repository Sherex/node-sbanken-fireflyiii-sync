import * as Firefly from '../types'
import axios, { AxiosInstance } from 'axios'

export * from '../types'

interface FireflyClientOptions {
  baseUrl: string
  token: string
}

export class FireflyClient {
  private readonly client: AxiosInstance

  constructor (options: FireflyClientOptions) {
    this.client = axios.create({
      baseURL: options.baseUrl,
      headers: {
        authorization: `Bearer ${options.token}`
      }
    })
  }

  async getUser (): Promise<Firefly.User> {
    const response = await this.client.get('/api/v1/about/user')
    const data: Firefly.Schemas['UserSingle'] = response.data
    return data.data
  }

  async getAccounts (): Promise<Firefly.Account[]> {
    const response = await this.client.get('/api/v1/accounts')
    const data = response.data as Firefly.Schemas['AccountArray']
    return data.data
  }

  async getCurrency (code: string): Promise<Firefly.Currency | null> {
    try {
      const response = await this.client.get(`/api/v1/currencies/${code}`)
      const data = response.data as Firefly.Schemas['CurrencySingle']
      return data.data
    } catch (error) {
      if (error.response.status === 404) return null
      throw error
    }
  }

  async createAccount (account: Firefly.AccountCreate): Promise<Firefly.Account> {
    const response = await this.client.post('/api/v1/accounts', account)
    const data = response.data as Firefly.Schemas['AccountSingle']
    return data.data
  }

  async createCurrency (currency: Firefly.CurrencyCreate): Promise<Firefly.Currency> {
    const response = await this.client.post('/api/v1/currencies', currency)
    const data = response.data as Firefly.Schemas['CurrencySingle']
    return data.data
  }

  async createTransaction (transaction: Firefly.TransactionCreate): Promise<Firefly.Transaction> {
    const response = await this.client.post('/api/v1/transactions', transaction)
    const data = response.data as Firefly.Schemas['TransactionSingle']
    return data.data
  }
}
