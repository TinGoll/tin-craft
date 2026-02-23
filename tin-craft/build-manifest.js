// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto')

// 1. Настройки
const BUILD_DIR = path.join(__dirname, 'server-build')
const SOURCE_DIR = path.join(__dirname, 'resources')
const BASE_URL = 'https://tincraft.ru/updates'

const INCLUDE_FOLDERS = ['mods', 'config']
const INCLUDE_FILES = ['forge-installer.jar', 'options.txt']
const IGNORE_PATTERNS = ['.DS_Store', 'Thumbs.db']

const FOLDER_POLICIES = {
  mods: 'overwrite',
  config: 'once',
  special: 'force_once'
}

// Хелпер для хэша файла
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath)
  return crypto.createHash('sha1').update(fileBuffer).digest('hex')
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles

  const files = fs.readdirSync(dirPath)
  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  }
  return arrayOfFiles
}

const manifest = { files: [] }

if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true })
}

console.log('Генерация манифеста...')

INCLUDE_FOLDERS.forEach((folder) => {
  const fullPath = path.join(SOURCE_DIR, folder)
  const files = getAllFiles(fullPath)

  files.forEach((filePath) => {
    const relativePath = path.relative(SOURCE_DIR, filePath).split(path.sep).join('/')
    if (IGNORE_PATTERNS.some((pattern) => relativePath.includes(pattern))) {
      console.log(`- [IGNORED] ${relativePath}`)
      return
    }

    const rootFolder = relativePath.split('/')[0]
    const policy = FOLDER_POLICIES[rootFolder] || 'overwrite'

    manifest.files.push({
      path: relativePath,
      url: encodeURI(`${BASE_URL}/${relativePath}`),
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
      url: encodeURI(`${BASE_URL}/${fileName}`),
      sha1: getFileHash(filePath),
      size: fs.statSync(filePath).size,
      policy: 'force_once'
    })
    console.log(`+ [FORCE_ONCE] ${fileName}`)
  } else {
    console.warn(`WARNING: Файл ${fileName} не найден!`)
  }
})

fs.writeFileSync(path.join(BUILD_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`Готово! Не забудь залить файлы из resources и manifest.json на сервер.`)
