import matter from 'gray-matter'
import { z } from 'zod'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

const postFiles = import.meta.glob('../../content/posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const FrontmatterSchema = z
  .object({
    title: z.string(),
    date: z.string().optional(),
    description: z.string().optional(),
  })
  .passthrough()

export type Frontmatter = z.infer<typeof FrontmatterSchema>

export type PostSummary = {
  slug: string
  frontmatter: Frontmatter
}

export type Post = {
  frontmatter: Frontmatter
  content: string
}

export const getPosts = (): PostSummary[] => {
  return Object.entries(postFiles).map(([filePath, raw]) => {
    const { data } = matter(raw)
    const frontmatter = FrontmatterSchema.parse(data)
    const slug = filePath.split('/').pop()?.replace(/\.md$/, '') ?? ''
    return {
      slug,
      frontmatter,
    }
  })
}

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const filePath = Object.keys(postFiles).find((p) => p.endsWith(`/content/posts/${slug}.md`))
  const raw = filePath ? postFiles[filePath] : undefined
  if (!raw) return null

  const { data, content } = matter(raw)
  const frontmatter = FrontmatterSchema.parse(data)
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content)
  return { frontmatter, content: processed.toString() }
}
