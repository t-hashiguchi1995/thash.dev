```txt
npm install
npm run dev
```

Lint / format / typecheck:

```txt
npm run check
```

Build (SSG):

```txt
npm run build
```

## Writing posts

Posts live in `content/posts/*.md` and are parsed with `gray-matter`.

- **Always start from a template** in `content/template/`:
  - `content/template/template_web.md`
  - `content/template/template_ml.md`
- **Create a new post** by copying a template to `content/posts/<slug>.md`.
- **Keep YAML frontmatter at the top** (at least `title`; `date` / `description` are optional).

## Design

Design tokens are defined in `DESIGN.md` and implemented as CSS custom properties in `public/static/style.css`.

## Deploy (Cloudflare Pages)

- GitHub Actions is configured to auto-deploy on `main` updates.
- Set the following in your GitHub repo settings:
  - Secrets
    - `CLOUDFLARE_API_TOKEN`
    - `CLOUDFLARE_ACCOUNT_ID`
  - Variables
    - `CF_PAGES_PROJECT` (Cloudflare Pages project name)

Cloudflare Pages project setting:

- **Automatic deployments**: Disabled (use GitHub Actions only)

```txt
npm run deploy
```

## Domain / SEO / Security (Cloudflare)

Detailed policy is documented in:

- `docs/adr/0001-cloudflare-domain-seo-security.md`

Quick notes:

- Canonical host: `thash.dev` (`www` redirects to apex with 301 at Cloudflare)
- SEO endpoints:
  - `/sitemap.xml`
  - `/robots.txt`
- Post frontmatter supports `description:` for OGP descriptions.

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
