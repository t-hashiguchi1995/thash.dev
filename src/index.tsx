import { Hono } from 'hono'
import { ssgParams } from 'hono/ssg'
import { getPosts, getPostBySlug } from './utils/content'

const app = new Hono()

// トップページ（記事一覧）
app.get('/', (c) => {
  const posts = getPosts()
  return c.html(
    <div>
      <h1>thash.dev</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <a href={`/posts/${post.slug}`}>{post.frontmatter.title}</a>
          </li>
        ))}
      </ul>
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
  (c) => {
    const slug = c.req.param('slug')
    if (!slug) return c.notFound()
    const post = getPostBySlug(slug)
    if (!post) return c.notFound()

    return c.html(
      <article>
        <h1>{post.frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>,
    )
  },
)

export default app
