---
title: 'Cloudflare Pages を独自ドメインで運用する手順メモ（301/SSL/SEO/OGP/sitemap/robots）'
date: '2026-04-30'
description: 'Cloudflare Pages に独自ドメインを割り当て、www→apexの301、Full(strict)、Bot対策、canonical/OGP/sitemap/robots まで一通り整える手順まとめ。'
---

Cloudflare Pages を `*.pages.dev` から独自ドメイン（例: `thash.dev`）に切り替えて、「安全に運用できる状態」まで整えるための備忘録です。  
単にドメインを生やすだけじゃなく、`www` 統一、SSL/TLS、そして SEO の最低限（canonical / OGP URL / sitemap / robots）まで一気に揃えるところまでを書きます。

## ゴール

- `thash.dev` で本番公開できる
- `www.thash.dev` は `thash.dev` に **301** で統一される（プライマリー問題を実質解決）
- HTTPS/TLS 設定が最低限強い
- SEO 基本セット（canonical / OGP URL / sitemap / robots）が揃っている

## 実行したコマンド（作業ログ）

今回の作業で実行したコマンドはだいたいこのあたり。

```txt
npm install
npm run dev
npm run build
npm run check
```

フォーマットは必要に応じて Prettier を当てた。

```txt
npx prettier . --write
```

## 1. ドメインを取得して Cloudflare に統一する（Registrar + DNS）

### やったこと

- 希望ドメイン（`thash.com`）が取れなかったため、空いていた `thash.dev` を取得
- Cloudflare Registrar で購入し、DNS も Cloudflare 管理に統一

### 技術ブログ的に書いておきたいポイント

- 独自ドメインは「Pagesが無料」でも **ドメイン代**は別（どこで買っても同じ）
- DNSまでCloudflareに寄せると、Pages側のドメイン設定がかなり楽（案内/自動設定が効く）

## 2. Cloudflare Pages に独自ドメインを割り当てる

### やったこと

- Pages の Custom domains に `thash.dev` / `www.thash.dev` を追加
- 両方 `Active` + `SSL enabled` になり、アクセスできることを確認

### 技術ブログ的に書いておきたいポイント

- 最初は DNS / 証明書の反映で少し待つことがある（UIに「最大48h」みたいに出る）
- まず `thash.dev` でアクセスできるか確認してから、`www` の統一に進むと安全

## 3. 正規ホスト（プライマリー）を `thash.dev` に統一する（www → apex）

Pages の UI で「Primary domain」が出ないケースがあるので、Cloudflare 側のリダイレクトで解決するのが確実。

### やったこと

- Cloudflare の Redirect Rule で `www.thash.dev` → `thash.dev` を **301** リダイレクト
  - パス/クエリは保持

### 技術ブログ的に書いておきたいポイント

- `www` と apex が両方生きていると、検索エンジン的には「別ページ」と見なされうる
- 301 を張っておけば、正規URLがブレにくい（canonicalと合わせて盤石）

## 4. Cloudflare のセキュリティ設定（最低限）

### やったこと

- SSL/TLS Encryption mode を **Full (strict)** に設定
- Edge Certificates（表示があるもの）を有効化
  - Always Use HTTPS
  - Automatic HTTPS Rewrites
  - Minimum TLS Version: 1.2+
  - TLS 1.3
  - Opportunistic Encryption
- Bot Fight Mode を ON（利用可能な範囲で）

### 技術ブログ的に書いておきたいポイント（注意事項込み）

- **Full (strict)** は「TLSがちゃんと張れている」前提で一段安心（できるなら基本これ）
- HSTS は強いが戻しづらいので、最初は無理に触らない（やるなら段階導入）

## 5. SEO の基本セットを入れる（コード側）

独自ドメイン化すると「`www` と apex の混在」「プレビューURL混入」などで正規URLがブレやすい。  
なのでコード側でも、canonical と OGP のURLを明示しておくと安心。

### 5.1 canonical / og:url（`https://thash.dev` を絶対URLで固定）

このサイトは SSG も使うので「リクエストURLから動的生成」よりも、**正規ドメイン `https://thash.dev` を起点に固定で生成**する方が安全。

```ts
export type PageMeta = {
  title?: string
  description?: string
  canonicalPath?: string
}

export const SITE_ORIGIN = 'https://thash.dev'

export function toAbsoluteUrl(pathname: string): string {
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${SITE_ORIGIN}${cleanPath}`
}

export function defaultMeta(): Required<Pick<PageMeta, 'title' | 'description' | 'canonicalPath'>> {
  return {
    title: 'thash.dev',
    description: 'Personal site.',
    canonicalPath: '/',
  }
}
```

head では canonical と OGP URL を出す。

```tsx
const meta = { ...defaultMeta(), ...(c.get('meta') ?? {}) }
const canonicalUrl = toAbsoluteUrl(meta.canonicalPath)
const pageTitle = meta.title

return (
  <html>
    <head>
      <title>{pageTitle}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={meta.description} />
    </head>
  </html>
)
```

各ページ側は `meta` をセットして title/description/canonicalPath を切り替える。

```ts
c.set('meta', {
  title: 'Products | thash.dev',
  description: 'Products.',
  canonicalPath: '/products',
})
```

### 5.2 sitemap.xml / robots.txt

アプリ側で `/sitemap.xml` と `/robots.txt` を返す。

```ts
app.get('/robots.txt', (c) => {
  return c.text(`User-agent: *\nAllow: /\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`)
})

app.get('/sitemap.xml', (c) => {
  const posts = getPosts()
  const urls: Array<{ loc: string; lastmod?: string }> = [
    { loc: `${SITE_ORIGIN}/` },
    { loc: `${SITE_ORIGIN}/products` },
    ...posts.map((p) => ({
      loc: `${SITE_ORIGIN}/posts/${p.slug}`,
      lastmod: p.frontmatter.date,
    })),
  ]

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(({ loc, lastmod }) => {
        const lastmodTag =
          typeof lastmod === 'string' && lastmod.trim().length > 0
            ? `<lastmod>${lastmod}</lastmod>`
            : ''
        return `  <url><loc>${loc}</loc>${lastmodTag}</url>`
      })
      .join('\n') +
    `\n</urlset>\n`

  c.header('content-type', 'application/xml; charset=utf-8')
  return c.body(xml)
})
```

### 5.3 OGP description（記事 frontmatter に `description:` を追加）

記事の frontmatter schema に `description` を追加した。

```ts
const FrontmatterSchema = z
  .object({
    title: z.string(),
    date: z.string().optional(),
    description: z.string().optional(),
  })
  .passthrough()
```

記事側はこう書ける。

```md
---
title: 'Hello thash.dev'
date: '2026-04-29'
description: 'Hono + Cloudflare Pages でブログを始めました。'
---
```

## 未対応事項（これからやる）

- Cloudflare アカウントの **2FA 有効化**（運用のセキュリティとして最優先）
- ドメインの **自動更新がON**か最終確認（失効事故を防ぐ）
- Google Search Console 登録 + sitemap 送信
- `og:image`（OGP画像）対応
  - まずは固定画像でもOK
  - 余裕が出たら記事タイトルから自動生成しても良い
- もしアクセスが増えたら、Cloudflare Rules/WAF 側でスキャン対策を追加
