export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer class="siteFooter">
      <div class="siteFooterInner">
        <div class="siteFooterCopy">© {year} thash.dev</div>
        <div class="siteFooterLinks">
          <a href="https://github.com/t-hashiguchi1995" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
