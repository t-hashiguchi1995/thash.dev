import { useRequestContext } from 'hono/jsx-renderer'

export const PostCta = () => {
  const c = useRequestContext<{ Bindings: CloudflareBindings }>()
  const bmcUrl = c.env.BMC_URL ?? 'https://www.buymeacoffee.com/'

  return (
    <section class="ctaCard" aria-label="Support this blog">
      <div class="ctaCardInner">
        <div class="ctaTitle">この記事が役に立ったら</div>
        <div class="ctaBody">Buy Me a Coffee で応援してもらえると嬉しいです。</div>
      </div>
      <div class="ctaActions">
        <a
          class="ctaButton"
          href={bmcUrl}
          target="_blank"
          rel="noreferrer"
          onclick="window.thashTrack && window.thashTrack('cta_bmc_click', { placement: 'post_end' });"
        >
          Buy Me a Coffee
        </a>
      </div>
    </section>
  )
}
