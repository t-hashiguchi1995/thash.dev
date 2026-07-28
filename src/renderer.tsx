import { jsxRenderer } from 'hono/jsx-renderer'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { defaultMeta, toAbsoluteUrl } from './utils/seo'

export const renderer = jsxRenderer(({ children }, c) => {
  const ga4MeasurementId = c.env.GA4_MEASUREMENT_ID
  const meta = { ...defaultMeta(), ...(c.get('meta') ?? {}) }
  const canonicalUrl = toAbsoluteUrl(meta.canonicalPath)
  const pageTitle = meta.title

  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{pageTitle}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={meta.description} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=M+PLUS+Rounded+1c:wght@700;800&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />

        {ga4MeasurementId ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4MeasurementId}');
window.thashTrack = function(name, params){
  try { gtag('event', name, params || {}); } catch (e) {}
};
`.trim(),
              }}
            />
          </>
        ) : null}
      </head>
      <body>
        <Header />
        <main class="siteMain">{children}</main>
        <Footer />
      </body>
    </html>
  )
})
