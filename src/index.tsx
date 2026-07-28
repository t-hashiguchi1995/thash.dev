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
  return 'Notes'
}

// トップページ
app.get('/', (c) => {
  c.set('meta', {
    title: 'thash.dev',
    description:
      '個人開発したアプリの紹介や、Web開発・インフラまわりの備忘録。Cloudflare で動く thash.dev。',
    canonicalPath: '/',
  })
  const posts = sortPostsByDateDesc()
  const latest = posts.slice(0, 3)

  return c.render(
    <div class="home">
      <section class="hero" aria-label="Introduction">
        <div class="heroCopy">
          <div class="heroBadge">Web Developer / Cloudflare</div>
          <h1 class="heroTitle">
            <span class="heroBrand">thash.dev</span>
            <span class="heroTitleLine">つくったもの、</span>
            <span class="heroTitleLine">学んだことを、</span>
            <span class="heroTitleLine">
              <span class="heroAccent">気ままに</span>記録する場所。
            </span>
          </h1>
          <p class="heroLead">
            個人開発したアプリの紹介や、Web 開発・インフラまわりの備忘録を書いています。Cloudflare
            で動いているこのサイトも、ゆるく育てていく予定です。
          </p>
          <div class="heroActions">
            <a class="btn btnPrimary" href="#articles">
              記事を読む
            </a>
            <a class="btn btnSecondary" href="/products">
              アプリを見る
            </a>
          </div>
        </div>

        <div class="heroVisual" aria-hidden="true">
          <div class="heroVisualCard">
            <div class="heroVisualDot" />
            <div class="heroVisualName">thash.dev</div>
            <div class="heroVisualMeta">notes &amp; experiments</div>
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
          <h2 class="sectionTitle">最新の記事</h2>
          {posts.length > 3 ? (
            <a class="sectionMore" href="#articles">
              すべて見る →
            </a>
          ) : null}
        </div>

        {latest.length === 0 ? (
          <p class="emptyHint">まだ記事がありません。</p>
        ) : (
          <div class="postCardGrid">
            {latest.map((post) => {
              const tag = guessTag(post.frontmatter.title, post.frontmatter.description)
              return (
                <a class="postCard" href={`/posts/${post.slug}`} key={post.slug}>
                  <div class="postCardThumb" data-tag={tag}>
                    <span class="postCardThumbLabel">{tag}</span>
                  </div>
                  <div class="postCardBody">
                    <span class="postCardTag">{tag}</span>
                    <h3 class="postCardTitle">{post.frontmatter.title}</h3>
                    {post.frontmatter.date ? (
                      <p class="postCardMeta">{post.frontmatter.date}</p>
                    ) : null}
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
                  <span class="postListQuietDate">{post.frontmatter.date}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section class="homeSection" id="apps">
        <div class="sectionHead">
          <h2 class="sectionTitle">個人開発アプリ</h2>
          <a class="sectionMore" href="/products">
            すべて見る →
          </a>
        </div>
        <div class="appStrip">
          <div class="appStripItem">
            <div class="appStripIcon" aria-hidden="true">
              #
            </div>
            <div>
              <h3 class="appStripTitle">Products</h3>
              <p class="appStripBody">準備中。詳細ができ次第、ここに追加します。</p>
              <div class="appStripTags">
                <span>Coming soon</span>
              </div>
            </div>
          </div>
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
    description: '個人開発したアプリ・OSS。',
    canonicalPath: '/products',
  })
  return c.render(
    <div class="page">
      <header class="pageHeader">
        <h1 class="pageTitle">つくったアプリ</h1>
        <p class="pageSubtitle">個人開発したアプリ・OSSをまとめています。</p>
      </header>

      <div class="productGrid" role="list">
        <div class="productCard" role="listitem">
          <div class="productTitle">Product #1</div>
          <div class="productBody">準備中。詳細ができ次第、ここに追加します。</div>
        </div>
        <div class="productCard" role="listitem">
          <div class="productTitle">Product #2</div>
          <div class="productBody">準備中。詳細ができ次第、ここに追加します。</div>
        </div>
        <div class="productCard" role="listitem">
          <div class="productTitle">Product #3</div>
          <div class="productBody">準備中。詳細ができ次第、ここに追加します。</div>
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
