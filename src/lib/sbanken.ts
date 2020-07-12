import axios, { AxiosInstance } from 'axios'
import { sbanken } from './load-config'
import * as SBanken from './sbanken.types'
import toUrlEncodedFormData from './to-url-encoded-form-data'

export default class SBankenClient {
  private readonly client: AxiosInstance
  private readonly options: SBanken.ClientOptionsData
  private tokenData: SBanken.TokenData | undefined

  constructor (options: SBanken.ClientParamOptions) {
    if (typeof options.baseUrlApi !== 'string') options.baseUrlApi = sbanken.baseUrlApi
    if (typeof options.baseUrlAuth !== 'string') options.baseUrlAuth = sbanken.baseUrlAuth
    if (!SBanken.isClientOptionsData(options)) throw Error('Wrong options received from config')
    this.options = options

    this.client = axios.create({
      baseURL: typeof options.baseUrlApi !== 'undefined' ? options.baseUrlApi : sbanken.baseUrlApi,
      headers: {
        customerId: options.customerId
      }
    })
  }

  async getToken (): Promise<SBanken.TokenData> {
    if (this.tokenData?.expires !== undefined && this.tokenData.expires > Date.now()) {
      return this.tokenData
    }

    const baseUrlAuth = this.options.baseUrlAuth
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
    const tokenResponse = response.data as SBanken.TokenAPIResponse

    const expiresBuffer = 30 // seconds
    this.tokenData = {
      accessToken: tokenResponse.access_token,
      tokenType: tokenResponse.token_type,
      expires: Date.now() + (tokenResponse.expires_in - expiresBuffer),
      scopes: response.data.scope.split(' ')
    }

    if (this.tokenData.tokenType.match(/bearer/i) === null) throw Error(`Received unknown token from API: "${this.tokenData.tokenType}"`)

    return this.tokenData
  }

  private async updateClientToken (): Promise<void> {
    const tokenData = await this.getToken()
    const bearerToken = `${tokenData.tokenType} ${tokenData.accessToken}`
    this.client.defaults.headers.common.Authorization = bearerToken
  }

  async getAccounts (): Promise<SBanken.APIAccounts> {
    await this.updateClientToken()
    const { data } = await this.client.get('/exec.bank/api/v1/accounts')

    return data as SBanken.APIAccounts
  }

  async getAccount (accountId?: SBanken.AccountID): Promise<SBanken.APIAccount> {
    await this.updateClientToken()
    const { data } = await this.client.get(`/exec.bank/api/v1/accounts/${accountId !== undefined ? accountId : ''}`)

    return data as SBanken.APIAccount
  }
}
