import { SBanken } from '@sherex/sbanken'
import * as config from './lib/load-config'
import { FireflyClient } from './lib/firefly'

(async () => {
  const sbanken = new SBanken(config.sbanken)
  console.log(JSON.stringify(await sbanken.getAccounts(), null, 2))

  const firefly = new FireflyClient({
    baseUrl: config.firefly.baseUrl,
    token: config.firefly.token
  })

  const data = await firefly.getUser()
  console.log(data.attributes)
})().catch(console.error)
