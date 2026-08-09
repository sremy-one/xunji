import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const { chromium } = require('D:/Nodejs/node_cache/_npx/e41f203b7505f1fb/node_modules/playwright')
const executablePath = 'C:/Users/HUAWEI/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'
const baseUrl = process.argv[2] || 'http://127.0.0.1:4173'
const screenshotPath = 'design/automation-home.png'
const resultPath = 'design/browser-qa.json'

const browser = await chromium.launch({ executablePath, headless: true })
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai',
  colorScheme: 'light',
})
const page = await context.newPage()
const errors = []
let phase = 'home'
page.on('pageerror', (error) => errors.push({ type: 'pageerror', phase, text: error.message, stack: error.stack }))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push({ type: 'console', text: message.text() })
})

await page.goto(`${baseUrl}/#/pages/today/index?preview=1`, { waitUntil: 'networkidle' })
await page.locator('.promo-poster').waitFor()
await page.screenshot({ path: screenshotPath, fullPage: false })

const home = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  bodyHeight: document.body.scrollHeight,
  title: document.title,
  posterVisible: !!document.querySelector('.promo-poster'),
}))

phase = 'workout'
await page.locator('.start-button').click()
await page.waitForURL(/packages\/planner\/pages\/select/)
await page.locator('.area-option:not(.unavailable)').first().click()
await page.locator('.confirm-button').click()
await page.waitForURL(/packages\/workout-bodyweight\/pages\/session/)
await page.getByText(/动作 1 \/ [4-8]/).waitFor()
const workoutRoute = page.url()
await page.locator('.exercise-stage').screenshot({ path: 'design/training-stage-environment-qa.png' })
const workout = await page.evaluate(() => {
  const stage = document.querySelector('.exercise-stage')
  const title = document.querySelector('.exercise-title')?.textContent?.trim() || ''
  const background = stage?.querySelector('.stage-background')
  const animation = stage?.querySelector('.exercise-animation')
  const getImageSource = (element) => element?.querySelector('img')?.getAttribute('src') || element?.getAttribute('src') || ''
  return {
    title,
    backgroundSrc: getImageSource(background),
    imageSrc: getImageSource(animation),
  }
})

await page.goto(`${baseUrl}/#/pages/today/index?preview=1`, { waitUntil: 'networkidle' })
phase = 'tab-navigation'
await page.locator('.tab-item').filter({ hasText: '训练' }).click()
await page.waitForURL(/pages\/train\/index/)
await page.getByText('训练计划', { exact: true }).waitFor()
const tabRoute = page.url()

const responsive = []
for (const viewport of [{ width: 768, height: 900 }, { width: 1280, height: 900 }]) {
  await page.setViewportSize(viewport)
  await page.goto(`${baseUrl}/#/pages/today/index?preview=1`, { waitUntil: 'networkidle' })
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    pageWidth: document.querySelector('uni-page-body')?.getBoundingClientRect().width || 0,
  }))
  responsive.push({ viewport: `${viewport.width}x${viewport.height}`, ...metrics })
  if (viewport.width === 768) await page.screenshot({ path: 'design/implementation-tablet.png', fullPage: false })
}

const result = {
  passed: errors.length === 0
    && home.scrollWidth === home.clientWidth
    && home.title === '由迹而寻'
    && home.posterVisible
    && !workout.title.startsWith('银铃')
    && workout.backgroundSrc.includes('training-stage-environment-v1.jpg')
    && workout.imageSrc.includes('.gif')
    && responsive.every((item) => item.scrollWidth === item.clientWidth && item.pageWidth <= 390),
  viewport: '390x844',
  home,
  responsive,
  workoutRoute,
  workout,
  tabRoute,
  errors,
}
writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`)
await browser.close()
console.log(JSON.stringify(result, null, 2))

if (!result.passed) process.exit(1)
