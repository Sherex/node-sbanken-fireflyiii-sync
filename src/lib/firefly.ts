import { components } from '../types/firefly-api'
import axios, { AxiosInstance } from 'axios'

interface FireflyClientOptions {
  baseUrl: string
  token: string
}

export class FireflyClient {
  private readonly baseUrl: string
  private readonly client: AxiosInstance

  constructor (options: FireflyClientOptions) {
    this.baseUrl = options.baseUrl

    this.client = axios.create({
      baseURL: options.baseUrl,
      headers: {
        authorization: `Bearer ${options.token}`
      }
    })
  }

  async getUser (): Promise<components['schemas']['UserRead']> {
    const response = await this.client.get('/api/v1/about/user')
    const data: components['schemas']['UserSingle'] = response.data
    return data.data
  }
}
