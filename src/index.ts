import { SBanken } from '@sherex/sbanken'
import { sbanken } from './lib/load-config'

(async () => {
  const client = new SBanken(sbanken)
  console.log(JSON.stringify(await client.getAccounts(), null, 2))
})().catch(console.error)
