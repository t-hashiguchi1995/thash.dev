---
title: 'Cloudflare Pages を独自ドメインで運用するチェックリスト（thash.dev の設定メモ）'
date: '2026-04-30'
description: 'Cloudflare Pages に独自ドメインを割り当て、www→apexの301、Full(strict)、Bot対策、canonical/OGP/sitemap/robots まで一通り整える手順まとめ。'
---

Cloudflare Pages を `*.pages.dev` から独自ドメイン（例: `thash.dev`）に切り替えて、「安全に運用できる状態」まで整えるための作業メモです。
同じことをやる人向けに、やったことと“これからやる必要があること”をチェックリストで残しておきます。

## ゴール

- `thash.dev` で本番公開できる
- `www.thash.dev` は `thash.dev` に **301** で統一される（プライマリー問題を実質解決）
- HTTPS/TLS 設定が最低限強い
- SEO 基本セット（canonical / OGP URL / sitemap / robots）が揃っている

## 1. ドメインを取得して Cloudflare に統一する

### やったこと

- 希望ドメイン（`thash.com`）が取れなかったため、空いていた `thash.dev` を取得
- Cloudflare Registrar で購入し、DNS も Cloudflare 管理に統一

### これからやる必要があること

- ドメイン自動更新が ON か最終確認（期限切れ事故を防ぐ）
- Cloudflare アカウントの 2FA を有効化（未設定なら最優先）

## 2. Cloudflare Pages に独自ドメインを割り当てる

### やったこと

- Pages の Custom domains に `thash.dev` / `www.thash.dev` を追加
- 両方 `Active` + `SSL enabled` になり、アクセスできることを確認

## 3. プライマリー（正規ホスト）を `thash.dev` に統一する

Pages の UI で「Primary domain」が出ないケースがあるため、Cloudflare 側で解決するのが確実。

### やったこと

- Cloudflare の Redirect Rule で `www.thash.dev` → `thash.dev` を **301** リダイレクト
  - パス/クエリは保持

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

### 注意

- HSTS は強いが戻しづらいので、運用が落ち着いてから段階導入が安全

## 5. SEO の基本セットを入れる（このリポジトリでやった実装）

独自ドメイン化すると「`www` と apex の混在」「プレビューURL混入」などで正規URLがブレやすいので、アプリ側でも明示しておくと安心。

### やったこと

- `<link rel="canonical">` を出力
- `<meta property="og:url">` を出力
  - どちらも `https://thash.dev` を origin として固定し、パスを組み合わせて生成
- `/sitemap.xml` を生成して配信（記事 + 固定ページ）
- `/robots.txt` を配信し、`Sitemap: https://thash.dev/sitemap.xml` を明記
- 各記事の frontmatter に `description:` を追加できるようにして、OGP説明を自然にできるようにした

### 関連コード

- head: `src/renderer.tsx`
- meta・sitemap・robots: `src/index.tsx`
- site origin/URL生成: `src/utils/seo.ts`
- frontmatter schema: `src/utils/content.ts`

## 6. この先やると良いこと（任意）

- OGP画像（`og:image`）を作る
  - まずは固定画像でもOK
  - その後、記事タイトルから自動生成する仕組みに拡張もできる
- Search Console にサイト登録して sitemap を送る
- もしアクセスが増えたら、Cloudflare Rules/WAF 側でスキャン対策を追加

---

今回の決定事項（ポリシー）は ADR にもまとめています。

- `docs/adr/0001-cloudflare-domain-seo-security.md`
