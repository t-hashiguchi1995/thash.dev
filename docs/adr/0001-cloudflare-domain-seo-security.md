# ADR 0001: Cloudflare Pages のドメイン統一・SEO・セキュリティ方針

- Status: Accepted
- Date: 2026-04-30

## Context

本サイトは Cloudflare Pages 上で公開しており、独自ドメイン `thash.dev` を利用する。
公開経路として `www.thash.dev` も併用されうるため、ホスト名の統一、検索エンジン向けの正規URL（canonical）、および最低限のセキュリティ設定を定義する必要がある。

## Decision

### Domain（正規ホスト）

- 正規ホストは `thash.dev` とする。
- `www.thash.dev` は Cloudflare 側の Redirect Rule で `thash.dev` へ **301** リダイレクトする（パス/クエリは保持）。

### SEO（canonical / OGP / sitemap / robots）

- HTML head に以下を出力する。
  - `<link rel="canonical" ...>`
  - `<meta property="og:url" ...>`
- canonical/`og:url` は **常に `https://thash.dev` を origin とする絶対URL**を生成して出力する（SSGでも正しいURLが焼き込まれる）。
- `/sitemap.xml` をアプリ側で生成して提供する。
  - 記事: `content/posts/*.md` から列挙
  - 固定ページ: `/`, `/products` を含める
- `/robots.txt` をアプリ側で提供し、`Sitemap: https://thash.dev/sitemap.xml` を明記する。

### Security（Cloudflare設定）

- SSL/TLS Encryption mode は `Full (strict)` とする。
- Edge Certificates（表示がある場合）は以下を有効化する。
  - Always Use HTTPS
  - Automatic HTTPS Rewrites
  - Minimum TLS Version: 1.2+
  - TLS 1.3
  - Opportunistic Encryption
- Bot Fight Mode は利用可能であれば有効化する（不具合があれば無効化してよい）。

## Implementation Notes

- head 出力: `src/renderer.tsx`
- meta の設定: `src/index.tsx`（各 route で `c.set('meta', ...)`）
- site origin/URL生成: `src/utils/seo.ts`（`SITE_ORIGIN = https://thash.dev`）
- `sitemap.xml` / `robots.txt`: `src/index.tsx`
- 記事の OGP description:
  - frontmatter に `description:` を追加可能（`src/utils/content.ts` の schema が対応）

## Consequences

- `www` / `apex` の混在による重複URLを避け、検索エンジンに正規URLを明確に伝えられる。
- `SITE_ORIGIN` を `https://thash.dev` に固定するため、別ドメイン（プレビュー等）を正規として扱わない。
- セキュリティ設定は Cloudflare の UI/プラン差分により項目名や有無が変わる可能性があるため、基本方針として保持する。
