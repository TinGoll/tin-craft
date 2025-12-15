// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto')

// 1. Настройки
const BUILD_DIR = path.join(__dirname, 'server-build')
const SOURCE_DIR = path.join(__dirname, 'resources')
const BASE_URL = 'http://localhost:3111/updates'

const INCLUDE_FOLDERS = ['mods', 'config']
const INCLUDE_FILES = ['forge-installer.jar', 'options.txt']
const IGNORE_PATTERNS = [
  'lookupHistory.json',
  'options.txt',
  'servers.dat',
  'servers.dat_old',
  'jei/world',
  'lookupHistory.json',
  '.DS_Store',
  'thumbs.db',
  'armoroftheages.json',
  'brutalbosses.json',
  // 'create_better_villagers',
  'cupboard.json',
  'jade/hide-blocks.json',
  'jade/hide-entities.json',
  'jade/jade.json',
  'jade/plugins.json',
  'jade/sort-order.json',
  'jei/blacklist.json',
  'livingthings/ancient_blaze.json',
  'livingthings/baby_ender_dragon.json',
  'livingthings/crab.json',
  'livingthings/elephant.json',
  'livingthings/flamingo.json',
  'livingthings/giraffe.json',
  'livingthings/koala.json',
  'livingthings/lion.json',
  'livingthings/livingthings.json',
  'livingthings/mantaray.json',
  'livingthings/monkey.json',
  'livingthings/nether_knight.json',
  'livingthings/ostrich.json',
  'livingthings/owl.json',
  'livingthings/owl.json',
  'livingthings/peacock.json',
  'livingthings/penguin.json',
  'livingthings/raccoon.json',
  'livingthings/seahorse.json',
  'livingthings/shark.json',
  'livingthings/shroomie.json',
  'livingthings/snail.json',
  'worldeditcui.config.json',
  'yacl.json5'
]

const FOLDER_POLICIES = {
  mods: 'overwrite',
  config: 'once'
  // config: 'overwrite'
}

// Хелпер для хэша
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath)
  const hashSum = crypto.createHash('sha1')
  hashSum.update(fileBuffer)
  return hashSum.digest('hex')
}

function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles || []

  const files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}

const manifest = { files: [] }

if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR)

console.log('Генерация манифеста...')

INCLUDE_FOLDERS.forEach((folder) => {
  const fullPath = path.join(SOURCE_DIR, folder)
  const files = getAllFiles(fullPath)

  files.forEach((filePath) => {
    const relativePath = path.relative(SOURCE_DIR, filePath).split(path.sep).join('/')
    const isIgnored = IGNORE_PATTERNS.some((pattern) => relativePath.includes(pattern))

    if (isIgnored) {
      console.log(`- [IGNORED] ${relativePath}`)
      return
    }

    const rootFolder = relativePath.split('/')[0]
    const policy = FOLDER_POLICIES[rootFolder] || 'overwrite'

    manifest.files.push({
      path: relativePath,
      url: `${BASE_URL}/${relativePath}`,
      sha1: getFileHash(filePath),
      size: fs.statSync(filePath).size,
      policy: policy
    })
    console.log(`+ [${policy.toUpperCase()}] ${relativePath}`)
  })
})

INCLUDE_FILES.forEach((fileName) => {
  const filePath = path.join(SOURCE_DIR, fileName)
  if (fs.existsSync(filePath)) {
    manifest.files.push({
      path: fileName,
      url: `${BASE_URL}/${fileName}`,
      sha1: getFileHash(filePath),
      size: fs.statSync(filePath).size
    })
    console.log(`+ [File]   ${fileName}`)
  } else {
    console.warn(`WARNING: Файл ${fileName} не найден!`)
  }
})

if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR)
fs.writeFileSync(path.join(BUILD_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`Готово! Не забудь залить файлы из resources и manifest.json на сервер.`)
