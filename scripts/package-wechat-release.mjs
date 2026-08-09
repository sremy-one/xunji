import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const buildRoot = path.join(projectRoot, 'dist', 'build', 'mp-weixin')
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
const defaultReleaseRoot = path.join(projectRoot, 'release', `mp-weixin-v${packageJson.version}`)
let releaseRoot = defaultReleaseRoot
const mediaExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.bmp',
  '.ico',
  '.mp3',
  '.wav',
  '.ogg',
  '.m4a',
  '.aac',
  '.flac',
  '.wma'
])
const mediaLimit = 200 * 1024

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? listFiles(target) : [target]
  })
}

if (!fs.existsSync(path.join(buildRoot, 'app.json'))) {
  throw new Error(`微信小程序构建产物不存在：${buildRoot}`)
}

try {
  fs.rmSync(releaseRoot, { recursive: true, force: true })
} catch (error) {
  if (error?.code !== 'EPERM' && error?.code !== 'EBUSY') throw error
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  releaseRoot = path.join(projectRoot, 'release', `mp-weixin-v${packageJson.version}-${timestamp}`)
  console.warn(`默认发布目录正被开发者工具占用，改用新目录：${releaseRoot}`)
}
fs.mkdirSync(path.dirname(releaseRoot), { recursive: true })
fs.cpSync(buildRoot, releaseRoot, { recursive: true })

const files = listFiles(releaseRoot)
const media = files
  .filter((file) => mediaExtensions.has(path.extname(file).toLowerCase()))
  .map((file) => ({
    file: path.relative(releaseRoot, file).replaceAll('\\', '/'),
    bytes: fs.statSync(file).size
  }))
  .sort((a, b) => b.bytes - a.bytes)
const oversizedMedia = media.filter((item) => item.bytes > mediaLimit)

if (oversizedMedia.length > 0) {
  console.table(oversizedMedia.map((item) => ({
    file: item.file,
    kb: +(item.bytes / 1024).toFixed(1)
  })))
  fs.rmSync(releaseRoot, { recursive: true, force: true })
  throw new Error('发布已中止：存在超过 200KB 的图片或音频资源')
}

const totalBytes = files.reduce((total, file) => total + fs.statSync(file).size, 0)
const largestMedia = media[0]

console.log(`微信发布目录：${releaseRoot}`)
console.log(`文件数量：${files.length}`)
console.log(`代码包总大小：${(totalBytes / 1024 / 1024).toFixed(2)}MB`)
console.log(`图片/音频数量：${media.length}`)
console.log(
  largestMedia
    ? `最大媒体资源：${largestMedia.file} (${(largestMedia.bytes / 1024).toFixed(1)}KB)`
    : '最大媒体资源：无'
)
console.log('媒体资源 200KB 检查：通过')
