import { Hono } from 'hono'
import { ssgParams } from 'hono/ssg'
import { renderer } from './renderer'
import { PostCta } from './components/PostCta'
import { getPosts, getPostBySlug } from './utils/content'
import { type PageMeta, SITE_ORIGIN } from './utils/seo'

const app = new Hono<{ Bindings: CloudflareBindings; Variables: { meta?: PageMeta } }>()

app.use(renderer)

app.get('/debug/env', (c) => {
  return c.json({ MY_VAR: c.env.MY_VAR })
})

const sortPostsByDateDesc = () =>
  getPosts().sort((a, b) => {
    const da = a.frontmatter.date ?? ''
    const db = b.frontmatter.date ?? ''
    return db.localeCompare(da)
  })

const guessTag = (title: string, description?: string) => {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('hello')) return 'Intro'
  const text = `${title} ${description ?? ''}`.toLowerCase()
  if (text.includes('cloudflare')) return 'Cloudflare'
  if (text.includes('worker')) return 'Workers'
  if (text.includes('seo') || text.includes('domain')) return 'SEO'
  return 'Notes'
}

const formatPostDate = (date?: string) => {
  if (!date) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return date
  const [, y, m, d] = match
  return `${y}年${Number(m)}月${Number(d)}日`
}

const HOME_TOPICS = [
  {
    label: 'Cloudflare',
    body: 'Pages / Workers / ドメイン周りで詰まったところを残します。',
  },
  {
    label: 'Web & インフラ',
    body: 'デプロイ、SSL、SEO、運用の最低ラインを手早く確認できる形で。',
  },
  {
    label: '個人開発',
    body: '小さく作って公開する過程そのものを、あとから見返せるようにします。',
  },
] as const

// トップページ
app.get('/', (c) => {
  c.set('meta', {
    title: 'thash.dev',
    description:
      'つくったもの・試したことを残す個人サイト。Cloudflare や Web 周りのメモと、個人開発の記録。',
    canonicalPath: '/',
  })
  const posts = sortPostsByDateDesc()
  const latest = posts.slice(0, 3)

  return c.render(
    <div class="home">
      <section class="hero" aria-label="Introduction">
        <div class="heroCopy">
          <div class="heroBadge">Web / Cloudflare / 個人開発</div>
          <h1 class="heroTitle">
            <span class="heroBrand">thash.dev</span>
            <span class="heroTitleLine">つくったもの、</span>
            <span class="heroTitleLine">試したことを、</span>
            <span class="heroTitleLine">
              <span class="heroAccent">そのまま</span>残す場所。
            </span>
          </h1>
          <p class="heroLead">
            Cloudflare や Web 周りの備忘録と、個人開発の記録を置いています。このサイト自体も Hono +
            Pages で動かしながら、少しずつ育てています。
          </p>
          <div class="heroActions">
            <a class="btn btnPrimary" href="#articles">
              記事を読む
            </a>
            <a class="btn btnSecondary" href="#topics">
              テーマを見る
            </a>
          </div>
        </div>

        <div class="heroVisual" aria-hidden="true">
          <div class="heroVisualCard">
            <div class="heroVisualDot" />
            <div class="heroVisualName">thash.dev</div>
            <div class="heroVisualMeta">Hono · Cloudflare Pages · notes</div>
            <div class="heroVisualGrid">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>

      <section class="homeSection" id="articles">
        <div class="sectionHead">
          <div>
            <h2 class="sectionTitle">最新の記事</h2>
            <p class="sectionLead">最近書いたメモからどうぞ。</p>
          </div>
        </div>

        {latest.length === 0 ? (
          <p class="emptyHint">まだ記事がありません。</p>
        ) : (
          <div class={`postCardGrid postCardGrid--${Math.min(latest.length, 3)}`}>
            {latest.map((post) => {
              const tag = guessTag(post.frontmatter.title, post.frontmatter.description)
              const description = post.frontmatter.description?.trim()
              const dateLabel = formatPostDate(post.frontmatter.date)
              return (
                <a class="postCard" href={`/posts/${post.slug}`} key={post.slug}>
                  <div class="postCardThumb" data-tag={tag}>
                    <span class="postCardThumbLabel">{tag}</span>
                  </div>
                  <div class="postCardBody">
                    <span class="postCardTag">{tag}</span>
                    <h3 class="postCardTitle">{post.frontmatter.title}</h3>
                    {description ? <p class="postCardDesc">{description}</p> : null}
                    {dateLabel ? <p class="postCardMeta">{dateLabel}</p> : null}
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {posts.length > 3 ? (
          <ul class="postListQuiet">
            {posts.slice(3).map((post) => (
              <li key={post.slug}>
                <a href={`/posts/${post.slug}`}>{post.frontmatter.title}</a>
                {post.frontmatter.date ? (
                  <span class="postListQuietDate">{formatPostDate(post.frontmatter.date)}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section class="homeSection" id="topics">
        <div class="sectionHead">
          <div>
            <h2 class="sectionTitle">書いていくテーマ</h2>
            <p class="sectionLead">広く浅くではなく、手が止まったところを優先して残します。</p>
          </div>
        </div>
        <div class="topicGrid">
          {HOME_TOPICS.map((topic) => (
            <div class="topicCard" key={topic.label}>
              <h3 class="topicTitle">{topic.label}</h3>
              <p class="topicBody">{topic.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section class="homeSection" id="apps">
        <div class="sectionHead">
          <div>
            <h2 class="sectionTitle">つくっているもの</h2>
            <p class="sectionLead">
              いま公開できるアプリはこれから。まずはこのサイト自体が実験場です。
            </p>
          </div>
          <a class="sectionMore" href="/products">
            Products →
          </a>
        </div>
        <div class="appStrip">
          <a class="appStripItem appStripItemLink" href="/">
            <div class="appStripIcon" aria-hidden="true">
              td
            </div>
            <div>
              <h3 class="appStripTitle">thash.dev</h3>
              <p class="appStripBody">
                Hono の SSG と Cloudflare Pages
                で動かす個人サイト。記事・SEO・ドメイン運用まで一通り載せていきます。
              </p>
              <div class="appStripTags">
                <span>Hono</span>
                <span>Pages</span>
                <span>SSG</span>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>,
  )
})

// 記事詳細ページ
app.get(
  '/posts/:slug',
  ssgParams(() => {
    const posts = getPosts()
    return posts.map((post) => ({ slug: post.slug }))
  }),
  async (c) => {
    const slug = c.req.param('slug')
    if (!slug) return c.notFound()
    const post = await getPostBySlug(slug)
    if (!post) return c.notFound()

    const description = post.frontmatter.description
    c.set('meta', {
      title: `${post.frontmatter.title} | thash.dev`,
      description:
        typeof description === 'string' && description.trim().length > 0 ? description : 'Post.',
      canonicalPath: `/posts/${slug}`,
    })

    const tag = guessTag(post.frontmatter.title, post.frontmatter.description)

    return c.render(
      <div class="page pageNarrow">
        <article class="article">
          <header class="postHeader">
            <div class="postTagRow">
              <span class="postCardTag">{tag}</span>
            </div>
            <h1 class="postTitle">{post.frontmatter.title}</h1>
            {post.frontmatter.date ? <div class="postMeta">{post.frontmatter.date}</div> : null}
          </header>
          <div class="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
          <PostCta />
        </article>
      </div>,
    )
  },
)

app.get('/products', (c) => {
  c.set('meta', {
    title: 'Products | thash.dev',
    description: '個人開発のアプリ・ツール。公開できるものができ次第追加します。',
    canonicalPath: '/products',
  })
  return c.render(
    <div class="page">
      <header class="pageHeader">
        <h1 class="pageTitle">つくったアプリ</h1>
        <p class="pageSubtitle">
          公開できるものができ次第、ここにまとめていきます。いまは thash.dev
          自体の運用と記事がメインです。
        </p>
      </header>

      <div class="productGrid" role="list">
        <div class="productCard" role="listitem">
          <div class="productTitle">thash.dev</div>
          <div class="productBody">
            Hono + Cloudflare Pages の個人サイト。記事、独自ドメイン、SEO
            まわりまで載せていく実験場です。
          </div>
        </div>
        <div class="productCard" role="listitem">
          <div class="productTitle">次のアプリ</div>
          <div class="productBody">準備中。小さく作って公開できたものから追加します。</div>
        </div>
      </div>
    </div>,
  )
})

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

export default app
