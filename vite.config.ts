import { defineConfig } from 'vite'
import honoSsg from '@hono/vite-ssg'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'

export default defineConfig({
  plugins: [
    devServer({
      adapter,
      entry: 'src/index.tsx',
    }),
    honoSsg({
      entry: 'src/index.tsx', // エントリポイントの指定
    }),
  ],
})
