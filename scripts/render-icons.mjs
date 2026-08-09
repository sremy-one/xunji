import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const playwrightPath = process.env.YOUJIERXUN_PLAYWRIGHT_PATH || 'D:/Nodejs/node_cache/_npx/e41f203b7505f1fb/node_modules/playwright'
const { chromium } = require(playwrightPath)
const sourceRoot = path.join(projectRoot, 'node_modules', '@phosphor-icons', 'core', 'assets', 'regular')
const outputRoot = path.join(projectRoot, 'src', 'static', 'icons')
const icons = {
  house: 'house', barbell: 'barbell', notebook: 'notebook', user: 'user', plant: 'plant',
  'sun-horizon': 'sun-horizon', clock: 'clock', check: 'check', 'arrow-right': 'arrow-right',
  'arrow-left': 'arrow-left', search: 'magnifying-glass', share: 'share-network', download: 'download-simple',
  shield: 'shield-check', trash: 'trash', 'check-circle': 'check-circle', play: 'play', pause: 'pause',
  x: 'x', circle: 'circle', 'arrows-clockwise': 'arrows-clockwise', 'skip-forward': 'skip-forward',
}

fs.mkdirSync(outputRoot, { recursive: true })
const cachedChromium = process.env.YOUJIERXUN_CHROMIUM_PATH || 'C:/Users/HUAWEI/AppData/Local/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-win64/chrome-headless-shell.exe'
const browser = await chromium.launch({ headless: true, executablePath: fs.existsSync(cachedChromium) ? cachedChromium : undefined })
for (const [outputName, sourceName] of Object.entries(icons)) {
  const svg = fs.readFileSync(path.join(sourceRoot, `${sourceName}.svg`), 'utf8')
  const page = await browser.newPage({ viewport: { width: 64, height: 64 }, deviceScaleFactor: 2 })
  await page.setContent(`<style>html,body{margin:0;width:64px;height:64px;background:transparent;color:#758ddd;display:flex;align-items:center;justify-content:center}svg{width:48px;height:48px}</style>${svg}`)
  await page.screenshot({ path: path.join(outputRoot, `${outputName}.png`), omitBackground: true })
  await page.close()
}
await browser.close()
console.log(`Rendered ${Object.keys(icons).length} Phosphor icons.`)
