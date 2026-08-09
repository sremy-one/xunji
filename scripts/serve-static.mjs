import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const root = normalize(process.argv[2] || 'dist/build/h5')
const port = Number(process.argv[3] || 4173)
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  let filePath = normalize(join(root, relativePath))

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, 'index.html')
  }

  response.setHeader('Content-Type', mime[extname(filePath)] || 'application/octet-stream')
  createReadStream(filePath)
    .on('error', () => {
      response.statusCode = 404
      response.end('Not found')
    })
    .pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`Youjierxun preview: http://127.0.0.1:${port}`)
})
