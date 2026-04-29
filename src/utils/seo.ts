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
