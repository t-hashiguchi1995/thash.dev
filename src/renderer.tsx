import { jsxRenderer } from 'hono/jsx-renderer'
import { Header } from './components/Header'
import { defaultMeta, toAbsoluteUrl } from './utils/seo'

export const renderer = jsxRenderer(({ children }, c) => {
  const ga4MeasurementId = c.env.GA4_MEASUREMENT_ID
  const meta = { ...defaultMeta(), ...(c.get('meta') ?? {}) }
  const canonicalUrl = toAbsoluteUrl(meta.canonicalPath)
  const pageTitle = meta.title

  return (
    <html>
      <head>
        <title>{pageTitle}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={meta.description} />

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
        <main class="container siteMain">{children}</main>
      </body>
    </html>
  )
})
