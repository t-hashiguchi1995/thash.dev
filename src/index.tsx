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

// トップページ（記事一覧）
app.get('/', (c) => {
  c.set('meta', {
    title: 'Posts | thash.dev',
    description: 'Posts and notes.',
    canonicalPath: '/',
  })
  const posts = getPosts()
  return c.render(
    <div class="page">
      <section class="card">
        <div class="cardInner">
          <h1 class="postListTitle">Posts</h1>
          <ul class="postList">
            {posts.map((post) => (
              <li class="postListItem" key={post.slug}>
                <a href={`/posts/${post.slug}`}>{post.frontmatter.title}</a>
              </li>
            ))}
          </ul>
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

    return c.render(
      <div class="page">
        <article class="card">
          <div class="cardInner">
            <header class="postHeader">
              <h1 class="postTitle">{post.frontmatter.title}</h1>
              {post.frontmatter.date ? <div class="postMeta">{post.frontmatter.date}</div> : null}
            </header>
            <div class="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
            <PostCta />
          </div>
        </article>
      </div>,
    )
  },
)

app.get('/products', (c) => {
  c.set('meta', {
    title: 'Products | thash.dev',
    description: 'Products.',
    canonicalPath: '/products',
  })
  return c.render(
    <div class="page">
      <section class="card">
        <div class="cardInner">
          <header class="pageHeader">
            <h1 class="pageTitle">Products</h1>
            <div class="pageSubtitle">Coming soon.</div>
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
        </div>
      </section>
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
