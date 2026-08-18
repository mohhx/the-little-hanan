# The Little Hanan — Next.js Project

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Copy your assets
Place all images from the original `assets/` folder into `/public/assets/`:
```
public/
  assets/
    header.png
    deals.png
    product-1.jpg  ... product-8.jpg
    category-1.jpg ... category-4.jpg
    blog-1.png     ... blog-3.png
    card-1.png     ... card-3.png
    instagram-1.jpg ... instagram-6.jpg
```

### 4. Add your logo
Place the logo file in `/public/logo.png` (or `.svg`).

---

## Project Structure

```
little-hanan/
├── app/
│   ├── layout.js          # Root layout — fonts, metadata
│   ├── globals.css        # Design tokens, reset, base styles
│   ├── page.js            # Homepage
│   ├── shop/              # Shop / catalogue page (Phase 1)
│   ├── product/           # Product detail page (Phase 1)
│   ├── sale/              # Sale page (Phase 1)
│   ├── blog/              # Blog listing + post pages (Phase 1)
│   ├── contact/           # Contact page (Phase 1)
│   ├── about/             # About page (Phase 1)
│   └── admin/             # Admin panel (Phase 2)
│       └── products/
├── components/
│   ├── layout/
│   │   ├── Navbar.js      # Sticky nav + fullscreen mobile menu
│   │   └── Footer.js      # Footer with brand + WhimsyNetting
│   ├── sections/
│   │   ├── Hero.js        # Homepage hero + marquee
│   │   ├── Categories.js  # Category circles grid
│   │   ├── TrendCards.js  # Editorial trend cards
│   │   ├── ProductGrid.js # Product grid with shuffle
│   │   ├── DealsSection.js# Live countdown deals
│   │   ├── WhimsyTeaser.js# WhimsyNetting sub-brand section
│   │   ├── TrustBanner.js # Trust indicators
│   │   ├── BlogSection.js # Blog card grid
│   │   └── NewsletterSection.js
│   └── ui/
│       ├── ProductCard.js  # Reusable product card
│       └── Reveal.js       # Scroll reveal component
├── lib/
│   └── products.js         # Placeholder data (→ Supabase in Phase 2)
└── public/
    └── assets/             # ← paste all your images here
```

---

## Brand Design Tokens

All custom properties are in `app/globals.css`:

| Token | Value | Use |
|-------|-------|-----|
| `--brand-black` | `#1A1A1A` | Primary dark / text |
| `--brand-rose` | `#D4789A` | Brand accent / CTA |
| `--brand-linen` | `#F5E8E4` | Warm cream background |
| `--brand-sage` | `#7A9E8A` | Grey-green accent |
| `--brand-greige` | `#E8E0D8` | Neutral surface |
| `--whimsy-deep` | `#E8698A` | WhimsyNetting accent |
| `--whimsy-light` | `#FBF0F4` | WhimsyNetting background |

---

## Phase Roadmap

- **Phase 1** (current) — Homepage, Shop, Product Detail, Sale, Blog, Contact, About
- **Phase 2** — Admin panel (Supabase), Newsletter API, Reviews
- **Phase 3** — Paystack payment integration, Order tracking

---

## Deployment

Push to GitHub → connect to [Vercel](https://vercel.com) → auto-deploys on every push.

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/little-hanan.git
git push -u origin main
```

Then import the repo on vercel.com — done.
