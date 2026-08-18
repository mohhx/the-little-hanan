import './globals.css'
import SiteChrome from '../components/layout/SiteChrome'

export const metadata = {
  title: {
    default: "The Little Hanan — Women's Fashion, Kaduna/Abuja",
    template: '%s | The Little Hanan',
  },
  description: "Curated women's fashion in Kaduna/Abuja. Shop dresses, accessories, jewellery and more — all priced in Naira.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}