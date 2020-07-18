import { firefly } from './load-config'
import { listenForCode } from './code-listener'
import ClientOAuth2 from 'client-oauth2'
import { URL } from 'url'
import open from 'open'

interface FireflyClientOptions {
  baseUrl: string
  auth: {
    clientId: string
    clientSecret: string
    redirectUri: string
  }
}

export class FireflyClient {
  private readonly baseUrl: URL
  private readonly redirectUri: URL
  private readonly client: ClientOAuth2
  private token: ClientOAuth2.Token | undefined

  constructor (options: FireflyClientOptions) {
    this.baseUrl = new URL(options.baseUrl)
    this.redirectUri = new URL(options.auth.redirectUri)

    this.client = new ClientOAuth2({
      clientId: options.auth.clientId,
      clientSecret: options.auth.clientSecret,
      redirectUri: options.auth.redirectUri,
      accessTokenUri: `${options.baseUrl}/oauth/token`,
      authorizationUri: `${options.baseUrl}/oauth/authorize`
    })
  }

  async authenticate (): Promise<void> {
    const listener = listenForCode(Number(this.redirectUri.port))
    await open(this.client.code.getUri())
    const code = await listener

    const responseUrl = new URL(this.redirectUri.href)
    responseUrl.searchParams.append('code', code)
    this.token = await this.client.code.getToken(responseUrl.href)
  }
}
