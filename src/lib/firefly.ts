import { firefly } from './load-config'
import ClientOAuth2 from 'client-oauth2'
import readline from 'readline'

const cli = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const client = new ClientOAuth2({
  clientId: firefly.clientId,
  clientSecret: firefly.clientSecret,
  redirectUri: 'http://empty',
  accessTokenUri: `${firefly.baseUrl}/oauth/token`,
  authorizationUri: `${firefly.baseUrl}/oauth/authorize`
})

function getUrl (): string {
  const url = client.code.getUri()
  return url
}

async function getResponse (url: string): Promise<any> {
  const response = await client.code.getToken(url)
  return response
}

console.log('Goto: ' + getUrl())
cli.question('Input Code: ', code => {
  getResponse(`http://empty?code=${code}`)
    .then(res => {
      console.log(res.data)
    })
    .catch(console.error)
})
