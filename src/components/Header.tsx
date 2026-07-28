export type HeaderProps = {
  subtitle?: string
}

export const Header = (_props: HeaderProps) => {
  return (
    <header class="siteHeader">
      <div class="siteHeaderInner">
        <a class="siteBrand" href="/">
          <span class="siteBrandMark" aria-hidden="true" />
          <span class="siteBrandTitle">thash.dev</span>
        </a>

        <nav class="siteNav" aria-label="Primary">
          <a class="siteNavLink" href="/">
            トップ
          </a>
          <a class="siteNavLink" href="/#articles">
            記事一覧
          </a>
          <a class="siteNavLink" href="/products">
            アプリ
          </a>
        </nav>
      </div>
    </header>
  )
}
