export type HeaderProps = {
  subtitle?: string
}

export const Header = ({ subtitle = 'notes & experiments' }: HeaderProps) => {
  return (
    <header class="siteHeader">
      <div class="siteHeaderInner">
        <a class="siteBrand" href="/">
          <span class="siteBrandTitle">thash.dev</span>
          <span class="siteBrandSubtitle">{subtitle}</span>
        </a>

        <nav class="siteNav" aria-label="Primary">
          <a class="siteNavLink" href="/">
            Home
          </a>
        </nav>
      </div>
    </header>
  )
}
