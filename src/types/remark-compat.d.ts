declare module 'remark' {
  export type RemarkProcessed = {
    toString(): string
  }

  export type RemarkProcessor = {
    use(plugin: unknown, options?: unknown): RemarkProcessor
    process(value: string): Promise<RemarkProcessed>
  }

  export const remark: () => RemarkProcessor
}

declare module 'remark-html' {
  const remarkHtml: unknown
  export default remarkHtml
}

declare module 'remark-gfm' {
  const remarkGfm: unknown
  export default remarkGfm
}
