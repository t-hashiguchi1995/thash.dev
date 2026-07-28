import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const styleCssPath = join(process.cwd(), 'public/static/style.css')

export const STYLE_CSS_HREF = `/static/style.css?v=${createHash('sha1')
  .update(readFileSync(styleCssPath))
  .digest('hex')
  .slice(0, 10)}`
