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
      headers: {
        customerId: options.customerId
      }
    })
  }

  async getBearerToken () {
    if (this.tokenData && this.tokenData.expires && this.tokenData.expires > Date.now()) {
      console.log('Using existing token!')
      const token = `${this.tokenData.token_type} ${this.tokenData.access_token}`
      return token
    }
    console.log('Getting new token!')

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
    this.client.defaults.headers.common.Authorization = await this.getBearerToken()
  }

  async getAccounts (accountId?: SBanken.AccountID) {
    await this.updateClientToken()
    const { data } = await this.client.get(`/exec.bank/api/v1/accounts/${accountId ? accountId : ''}`)

    return data as SBanken.APIAccounts
  }
}
