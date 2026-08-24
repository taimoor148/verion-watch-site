import { copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
copyFileSync(resolve(root, 'dist/index.html'), resolve(root, 'VERION.html'))
console.log('VERION.html ready at project root (double-click to open)')
