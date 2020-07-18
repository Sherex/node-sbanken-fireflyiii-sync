import http from 'http'
import { parse } from 'querystring'

interface listenForCodeReturn {
  getCode: () => Promise<string>
}

export function listenForCode (port: number = 8123): listenForCodeReturn {
  const code = new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (typeof req.url !== 'string') {
        res.end('Invalid request')
        return
      }
      const queryString = req.url.match(/\?(?<query>.*)/)
      if (typeof queryString?.groups?.query !== 'string') {
        res.end('Missing querystring with "code" property')
        return
      }
      const query = parse(queryString.groups.query)
      if (typeof query.code !== 'string') {
        res.end('Missing property "code" in querystring')
        return
      }
      resolve(query.code)
      res.end(responseOk)
    })

    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
      reject(err)
    })

    server.listen(port)
  })

  return {
    getCode: async () => await code
  }
}

const responseOk = `
  <div align=center>
    <h1>Authentication successful!</h1>
    <p>You can now close this window</p>
  </div>
`.trim()
