```txt
npm install
npm run dev
```

Lint / format / typecheck:

```txt
npm run check
```

Deploy (Cloudflare Pages):

- GitHub Actions is configured to auto-deploy on `main` updates.
- Set the following in your GitHub repo settings:
  - Secrets
    - `CLOUDFLARE_API_TOKEN`
    - `CLOUDFLARE_ACCOUNT_ID`
  - Variables
    - `CF_PAGES_PROJECT` (Cloudflare Pages project name)

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
