import { SBanken } from '@sherex/sbanken'
import * as config from './lib/load-config'
import { FireflyClient } from './lib/firefly'

(async () => {
  const sbanken = new SBanken(config.sbanken)
  console.log(JSON.stringify(await sbanken.getAccounts(), null, 2))

  const firefly = new FireflyClient({
    baseUrl: config.firefly.baseUrl,
    auth: {
      clientId: config.firefly.clientId,
      clientSecret: config.firefly.clientSecret,
      redirectUri: config.firefly.clientCallback
    }
  })

  await firefly.authenticate()
})().catch(console.error)
