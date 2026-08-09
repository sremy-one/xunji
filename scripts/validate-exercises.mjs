import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = path.join(projectRoot, 'src', 'data', 'exercises.generated.json')
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const errors = []

if (data.length !== 28) errors.push(`core set must contain 28 exercises, received ${data.length}`)
if (new Set(data.map((item) => item.id)).size !== data.length) errors.push('exercise ids must be unique')
if (data.filter((item) => item.equipment === 'body weight').length !== 14) errors.push('body weight quota mismatch')
if (data.filter((item) => item.equipment === 'dumbbell').length !== 8) errors.push('dumbbell quota mismatch')
if (data.filter((item) => ['band', 'resistance band'].includes(item.equipment)).length !== 6) errors.push('band quota mismatch')

for (const item of data) {
  if (!item.id.startsWith('yl-')) errors.push(`${item.id}: non-original id`)
  if (!item.nameZh || item.stepsZh?.length < 3 || !item.muscleText?.startsWith('锻炼')) {
    errors.push(`${item.id}: missing original localized content or muscle text`)
  }
  if (item.creator !== '由迹而寻原创' || item.license !== 'All Rights Reserved') {
    errors.push(`${item.id}: invalid creator or license`)
  }
  if (/Gym visual|gymvisual|Free Exercise DB|Unlicense/i.test(JSON.stringify(item))) {
    errors.push(`${item.id}: third-party release reference found`)
  }
  for (const mediaPath of [item.image, item.gif]) {
    const media = path.join(projectRoot, 'src', mediaPath.replace(/^\//, ''))
    if (!fs.existsSync(media)) errors.push(`${item.id}: missing media ${mediaPath}`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Validated ${data.length} original Silverling core exercises and animated media.`)
