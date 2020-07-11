import SBanken from './lib/sbanken'
import { config } from './lib/load-config'

(async () => {
  const client = new SBanken(config)
  console.log(JSON.stringify(await client.getToken(), null, 2))
  console.log(JSON.stringify(await client.getAccounts(), null, 2))
})().catch(console.error)
