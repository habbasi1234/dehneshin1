import { execSync } from 'child_process'
import { mkdirSync, writeFileSync, existsSync, readFileSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BACKUP_DIR = join(__dirname, 'backups')
const DATA_DIR = join(__dirname, 'data')
const MONGO_URI = 'mongodb://admin:dehneshin_secret_1404@localhost:27018/dehneshin?authSource=admin'

if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const backupPath = join(BACKUP_DIR, `backup-${timestamp}`)
mkdirSync(backupPath, { recursive: true })

// 1. Backup JSON data files
console.log('Backing up JSON data files...')
const dataFiles = ['products.json', 'categories.json', 'blog.json', 'users.json', 'orders.json', 'messages.json', 'customers.json', 'testimonials.json', 'notifications.json', 'analytics.json']
for (const file of dataFiles) {
  const src = join(DATA_DIR, file)
  if (existsSync(src)) copyFileSync(src, join(backupPath, file))
}

// 2. Backup MongoDB collections
console.log('Backing up MongoDB collections...')
try {
  execSync(`mongodump --uri="${MONGO_URI}" --out="${join(backupPath, 'mongodb')}"`, { stdio: 'pipe', timeout: 30000 })
  console.log('MongoDB dump created')
} catch {
  console.log('mongodump not available, skipping MongoDB dump')
}

// 3. Write backup manifest
const manifest = {
  timestamp: new Date().toISOString(),
  files: dataFiles.filter(f => existsSync(join(DATA_DIR, f))),
  mongodb: existsSync(join(backupPath, 'mongodb')),
  size: execSync(`powershell -c "(Get-ChildItem -Recurse '${backupPath}' | Measure-Object -Property Length -Sum).Sum"`).toString().trim(),
}
writeFileSync(join(backupPath, 'manifest.json'), JSON.stringify(manifest, null, 2))
writeFileSync(join(BACKUP_DIR, 'latest.json'), JSON.stringify(manifest, null, 2))

console.log(`Backup complete: ${backupPath}`)
