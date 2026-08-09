import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const buildRoot = path.join(projectRoot, 'dist', 'build', 'mp-weixin')
const vendorPath = path.join(buildRoot, 'common', 'vendor.js')
const includeFolders = [
  'packages/library/static/gifs',
  'packages/workout-bodyweight/static/gifs',
  'packages/workout-bodyweight/static/images',
  'packages/workout-equipment/static/gifs',
  'packages/workout-equipment/static/images'
]

const source = fs.readFileSync(vendorPath, 'utf8')
const preloadMarker = 'wx.preloadAssets'
const markerIndex = source.indexOf(preloadMarker)

if (markerIndex === -1) {
  console.log('Mini-program build has no remote shadow preload')
} else {
  const blockStart = source.lastIndexOf('!function(){', markerIndex)
  const createAppStart = source.indexOf('wx.createApp=', markerIndex)
  if (blockStart === -1 || createAppStart === -1 || source.indexOf(preloadMarker, createAppStart) !== -1) {
    throw new Error('Unexpected DCloud preload output; refusing to modify the build')
  }

  const sanitized = source.slice(0, blockStart) + source.slice(createAppStart)
  if (sanitized.includes(preloadMarker) || sanitized.includes('shadow-grey.png')) {
    throw new Error('Remote shadow preload was not removed')
  }

  fs.writeFileSync(vendorPath, sanitized)
  console.log('Removed undeclared DCloud shadow image preload from WeChat build')
}

const projectConfigPath = path.join(buildRoot, 'project.config.json')
const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'))
projectConfig.setting = {
  ...projectConfig.setting,
  ignoreDevUnusedFiles: false,
  ignoreUploadUnusedFiles: false
}
const existingIncludes = Array.isArray(projectConfig.packOptions?.include) ? projectConfig.packOptions.include : []
projectConfig.packOptions = {
  ...projectConfig.packOptions,
  include: [
    ...existingIncludes.filter((entry) => !includeFolders.includes(entry?.value)),
    ...includeFolders.map((value) => ({ type: 'folder', value }))
  ]
}
fs.writeFileSync(projectConfigPath, `${JSON.stringify(projectConfig, null, 2)}\n`)

const privateConfigPath = path.join(buildRoot, 'project.private.config.json')
const privateConfig = fs.existsSync(privateConfigPath)
  ? JSON.parse(fs.readFileSync(privateConfigPath, 'utf8'))
  : {}
privateConfig.setting = {
  ...privateConfig.setting,
  ignoreDevUnusedFiles: false,
  ignoreUploadUnusedFiles: false
}
fs.writeFileSync(privateConfigPath, `${JSON.stringify(privateConfig, null, 2)}\n`)
console.log('Pinned dynamic exercise media for upload and real-device debugging')
