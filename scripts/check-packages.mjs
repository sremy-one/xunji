import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'build', 'mp-weixin')
if (!fs.existsSync(root)) throw new Error(`微信小程序构建产物不存在：${root}`)

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const target = path.join(directory, item.name)
    return item.isDirectory() ? listFiles(target) : [target]
  })
}

function bytes(directory) {
  return listFiles(directory).reduce((sum, file) => sum + fs.statSync(file).size, 0)
}

const packageRoots = ['packages/planner', 'packages/library', 'packages/workout-bodyweight', 'packages/workout-equipment']
const total = bytes(root)
let subTotal = 0
const report = []
for (const packageRoot of packageRoots) {
  const directory = path.join(root, packageRoot)
  const size = fs.existsSync(directory) ? bytes(directory) : 0
  subTotal += size
  report.push({ package: packageRoot, mb: +(size / 1024 / 1024).toFixed(2), limitMb: 2, pass: size <= 2 * 1024 * 1024 })
}

const mainSize = total - subTotal
report.unshift({ package: 'main', mb: +(mainSize / 1024 / 1024).toFixed(2), limitMb: 1.5, pass: mainSize <= 1.5 * 1024 * 1024 })
report.push({ package: 'total', mb: +(total / 1024 / 1024).toFixed(2), limitMb: 20, pass: total <= 20 * 1024 * 1024 })
console.table(report)

const mediaExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.wav', '.aac', '.m4a'])
const oversizedMedia = listFiles(root)
  .filter((file) => mediaExtensions.has(path.extname(file).toLowerCase()) && fs.statSync(file).size > 200 * 1024)
  .map((file) => ({ file: path.relative(root, file).replaceAll('\\', '/'), kb: +(fs.statSync(file).size / 1024).toFixed(1) }))

const forbiddenMainFiles = ['services/share.js', 'utils/plan-builder.js']
  .filter((relativePath) => fs.existsSync(path.join(root, relativePath)))

const appConfig = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
const requiredComponentsEnabled = appConfig.lazyCodeLoading === 'requiredComponents'

const exerciseDataPath = path.resolve(root, '..', '..', '..', 'src', 'data', 'exercises.generated.json')
const exercises = JSON.parse(fs.readFileSync(exerciseDataPath, 'utf8'))
const exerciseMediaPackages = [
  'packages/library',
  'packages/workout-bodyweight',
  'packages/workout-equipment'
]
const missingExerciseMedia = exerciseMediaPackages.flatMap((packageRoot) => exercises.flatMap((exercise) => {
  const expected = [
    `${packageRoot}/static/gifs/${exercise.id}.gif`,
    `${packageRoot}/static/images/${exercise.id}.jpg`
  ]
  return expected.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)))
}))

console.log(`requiredComponents=${requiredComponentsEnabled}`)
console.log(`oversizedMedia=${oversizedMedia.length}`)
console.log(`knownUnusedMainJs=${forbiddenMainFiles.length}`)
console.log(`missingExerciseMedia=${missingExerciseMedia.length}`)
if (oversizedMedia.length) console.table(oversizedMedia)
if (forbiddenMainFiles.length) console.table(forbiddenMainFiles.map((file) => ({ file })))
if (missingExerciseMedia.length) console.table(missingExerciseMedia.map((file) => ({ file })))

if (report.some((item) => !item.pass) || oversizedMedia.length || forbiddenMainFiles.length || missingExerciseMedia.length || !requiredComponentsEnabled) {
  process.exit(1)
}
