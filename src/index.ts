import { SBanken } from '@sherex/sbanken'
import { sbanken, firefly } from './lib/load-config'
import { FireflyClient } from './lib/firefly'

(async () => {
  // const client = new SBanken(sbanken)
  // console.log(JSON.stringify(await client.getAccounts(), null, 2))
  const ff = new FireflyClient({
    baseUrl: firefly.baseUrl,
    auth: {
      clientId: firefly.clientId,
      clientSecret: firefly.clientSecret,
      redirectUri: firefly.clientCallback
    }
  })

  await ff.authenticate()
})().catch(console.error)
