import { jsxRenderer } from 'hono/jsx-renderer'
import { Header } from './components/Header'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <main class="container">{children}</main>
      </body>
    </html>
  )
})
