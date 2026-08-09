import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = path.join(root, 'src')
const forbiddenCopy = ['测试版', '后续', '未来版本', '开发中', '即将上线', '敬请期待', '暂未开放', '制作中', '预览版', '演示版', '课程项目']
const forbiddenRiskCopy = ['注册了账号', '银铃形象灵感来源']
const sourceExtensions = new Set(['.vue', '.ts', '.json'])

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const target = path.join(directory, item.name)
    return item.isDirectory() ? listFiles(target) : [target]
  })
}

const sourceFiles = listFiles(sourceRoot).filter((file) => sourceExtensions.has(path.extname(file)))
const copyViolations = []
const modalViolations = []
const buttonViolations = []
const deprecatedApiViolations = []
const privateInfoConfigViolations = []

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8')
  const relative = path.relative(root, file).replaceAll('\\', '/')

  if (content.includes('getSystemInfoSync')) deprecatedApiViolations.push({ file: relative, api: 'getSystemInfoSync' })
  if (content.includes('requiredPrivateInfos')) privateInfoConfigViolations.push({ file: relative, key: 'requiredPrivateInfos' })

  for (const phrase of [...forbiddenCopy, ...forbiddenRiskCopy]) {
    if (content.includes(phrase)) copyViolations.push({ file: relative, phrase })
  }

  for (const match of content.matchAll(/confirmText\s*:\s*['"]([^'"]+)['"]/g)) {
    if (Array.from(match[1]).length > 4) modalViolations.push({ file: relative, text: match[1] })
  }

  if (path.extname(file) === '.vue') {
    for (const match of content.matchAll(/<button\b[\s\S]*?>/g)) {
      if (!/@(?:tap|click|chooseavatar)=|open-type=|form-type=/.test(match[0])) {
        buttonViolations.push({ file: relative, button: match[0].replace(/\s+/g, ' ').slice(0, 120) })
      }
    }
  }
}

const pagesConfig = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'pages.json'), 'utf8'))
const registeredPages = [
  ...pagesConfig.pages.map((page) => page.path),
  ...pagesConfig.subPackages.flatMap((group) => group.pages.map((page) => `${group.root}/${page.path}`)),
]
const missingPages = registeredPages.filter((page) => !fs.existsSync(path.join(sourceRoot, `${page}.vue`)))

console.log(`releaseCopyViolations=${copyViolations.length}`)
console.log(`modalTextViolations=${modalViolations.length}`)
console.log(`buttonBindingViolations=${buttonViolations.length}`)
console.log(`missingRegisteredPages=${missingPages.length}`)
console.log(`deprecatedApiViolations=${deprecatedApiViolations.length}`)
console.log(`privateInfoConfigViolations=${privateInfoConfigViolations.length}`)
if (copyViolations.length) console.table(copyViolations)
if (modalViolations.length) console.table(modalViolations)
if (buttonViolations.length) console.table(buttonViolations)
if (missingPages.length) console.table(missingPages.map((file) => ({ file })))
if (deprecatedApiViolations.length) console.table(deprecatedApiViolations)
if (privateInfoConfigViolations.length) console.table(privateInfoConfigViolations)

if (copyViolations.length || modalViolations.length || buttonViolations.length || missingPages.length || deprecatedApiViolations.length || privateInfoConfigViolations.length) process.exit(1)
