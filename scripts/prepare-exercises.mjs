import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataFile = path.join(projectRoot, 'src', 'data', 'exercises.generated.json')
const statsFile = path.join(projectRoot, 'src', 'data', 'exercise-stats.generated.json')

if (!fs.existsSync(dataFile)) throw new Error(`Missing original exercise data: ${dataFile}`)

const exercises = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
const invalid = exercises.filter((item) =>
  !item.id?.startsWith('yl-')
  || item.creator !== '由迹而寻原创'
  || item.license !== 'All Rights Reserved'
  || !item.image?.startsWith('/packages/')
  || !item.gif?.startsWith('/packages/')
)

if (invalid.length) {
  throw new Error(`Refusing to prepare non-original exercise entries: ${invalid.map((item) => item.id).join(', ')}`)
}

const stats = {
  status: 'core-28',
  total: exercises.length,
  animated: exercises.filter((item) => item.gif).length,
  mediaType: 'original-yinling-gifs',
  byEquipment: Object.fromEntries(
    Object.entries(exercises.reduce((result, item) => ({
      ...result,
      [item.equipment]: (result[item.equipment] || 0) + 1,
    }), {})).sort(),
  ),
  creator: '由迹而寻原创',
  license: 'All Rights Reserved',
  referencePolicy: 'Reference media is local-only and excluded from release artifacts.',
  generatedAt: new Date().toISOString(),
}

fs.writeFileSync(statsFile, `${JSON.stringify(stats, null, 2)}\n`, 'utf8')
console.log(JSON.stringify(stats, null, 2))
