import axios, { AxiosInstance } from 'axios'
import { config } from './load-config'
import { SBanken } from './types'
import toUrlEncodedFormData from './to-url-encoded-form-data'

export default class SBankenClient {
  private options: SBanken.ClientOptions
  private tokenData: SBanken.TokenAPIData | undefined
  private client: AxiosInstance

  constructor (options: SBanken.ClientOptions) {
    this.options = options

    this.client = axios.create({
      baseURL: options.baseUrlApi || config.baseUrlApi,
      auth: {
        username: options.applicationId,
        password: options.applicationSecret
      },
      headers: {
        customerId: options.customerId
      }
    })
  }

  async getBearerToken () {
    if (this.tokenData && this.tokenData.expires && this.tokenData.expires > Date.now()) {
      const token = `${this.tokenData.token_type} ${this.tokenData.access_token}`
      return token
    }

    const baseUrlAuth = this.options.baseUrlAuth || config.baseUrlAuth
    const data = toUrlEncodedFormData({ grant_type: 'client_credentials' })
    const response = await axios.post(baseUrlAuth + '/identityserver/connect/token', data, {
      auth: {
        username: this.options.applicationId,
        password: this.options.applicationSecret
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    this.tokenData = response.data as SBanken.TokenAPIData
    this.tokenData.expires = Date.now() + (this.tokenData.expires_in - 30)
    this.tokenData.scope = response.data.scope.split(' ')

    if (!this.tokenData.token_type.match(/bearer/i)) throw Error(`Received unknown token from API: "${this.tokenData.token_type}"`)
  
    return `${this.tokenData.token_type} ${this.tokenData.access_token}`
  }

  private async updateClientToken () {
    this.client.defaults.headers.Authorization = await this.getBearerToken()
  }

  async getAccounts (accountId?: SBanken.AccountID) {
    console.log(this.client.defaults.headers)
    await this.updateClientToken()
    console.log(this.client.defaults.headers)

    const { data } = await this.client.get('/exec.bank/api/v1/accounts/' + accountId)
    return data as SBanken.APIAccounts
  }
}
