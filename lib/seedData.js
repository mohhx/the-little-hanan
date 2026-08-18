// lib/seedData.js
// Source data for the one-time Supabase migration script (scripts/migrate-to-supabase.js).

// PLACEHOLDER catalog — real category structure (Kimono, Head Veils,
// Two Piece, Dress, WhimsyNetting), but names/prices/images below are
// stand-ins. Edit these directly, then re-run
// `node scripts/migrate-to-supabase.js` (it upserts by slug, so re-running
// is safe and just updates existing rows / adds new ones).
export const PRODUCTS = [
  { id: '1',  slug: 'emerald-silk-kimono',   name: 'Emerald Silk Kimono',    price: 95000,  originalPrice: 130000, category: 'Kimono',     rating: 4.5, image: '/assets/product-1.jpg' },
  { id: '2',  slug: 'blush-floral-kimono',   name: 'Blush Floral Kimono',    price: 78000,  originalPrice: null,   category: 'Kimono',     rating: 4,   image: '/assets/product-2.jpg' },
  { id: '3',  slug: 'ivory-lace-head-veil',  name: 'Ivory Lace Head Veil',   price: 42000,  originalPrice: 60000,  category: 'Head Veils', rating: 5,   image: '/assets/product-3.jpg' },
  { id: '4',  slug: 'pearl-trim-head-veil',  name: 'Pearl Trim Head Veil',   price: 38000,  originalPrice: null,   category: 'Head Veils', rating: 4,   image: '/assets/product-4.jpg' },
  { id: '5',  slug: 'sage-two-piece-set',    name: 'Sage Two Piece Set',     price: 110000, originalPrice: 145000, category: 'Two Piece',  rating: 4.5, image: '/assets/product-5.jpg' },
  { id: '6',  slug: 'rose-coord-two-piece',  name: 'Rose Co-ord Two Piece',  price: 98000,  originalPrice: null,   category: 'Two Piece',  rating: 4,   image: '/assets/product-6.jpg' },
  { id: '7',  slug: 'linen-wrap-dress',      name: 'Linen Wrap Dress',       price: 85000,  originalPrice: 120000, category: 'Dress',      rating: 4.5, image: '/assets/product-7.jpg' },
  { id: '8',  slug: 'evening-column-dress',  name: 'Evening Column Dress',   price: 135000, originalPrice: null,   category: 'Dress',      rating: 5,   image: '/assets/product-8.jpg' },
  { id: '9',  slug: 'crochet-tote-bag',      name: 'Crochet Tote Bag',       price: 48000,  originalPrice: null,   category: 'WhimsyNetting', rating: 5,   image: '/assets/product-1.jpg' },
  { id: '10', slug: 'crochet-gloves',        name: 'Crochet Gloves',         price: 22000,  originalPrice: null,   category: 'WhimsyNetting', rating: 4.5, image: '/assets/product-2.jpg' },
  { id: '11', slug: 'crochet-phone-case',    name: 'Crochet Phone Case',     price: 15000,  originalPrice: null,   category: 'WhimsyNetting', rating: 4,   image: '/assets/product-3.jpg' },
  { id: '12', slug: 'crochet-sandals',       name: 'Crochet Sandals',        price: 35000,  originalPrice: null,   category: 'WhimsyNetting', rating: 5,   image: '/assets/product-4.jpg' },
]

export const CATEGORIES = [
  { name: 'Kimono',     image: '/assets/category-1.jpg', slug: 'kimono' },
  { name: 'Head Veils', image: '/assets/category-2.jpg', slug: 'head-veils' },
  { name: 'Two Piece',  image: '/assets/category-3.jpg', slug: 'two-piece' },
  { name: 'Dress',      image: '/assets/category-4.jpg', slug: 'dress' },
]

export const BLOG_POSTS = [
  {
    id: '1',
    slug: 'capsule-wardrobe',
    category: 'Timeless Elegance',
    title: 'Mastering the Art of Capsule Wardrobes',
    date: '12 Aug 2024',
    image: '/assets/blog-1.png',
    excerpt: 'How to build a wardrobe of fewer, better pieces that work harder for you — season after season.',
    body: [
      'A capsule wardrobe isn\u2019t about owning less for the sake of it \u2014 it\u2019s about owning exactly what earns its place. For the modern Nigerian woman moving between Lagos boardrooms, Abuja weekends and everything in between, that means pieces built to be restyled, not retired after one outing.',
      'Start with your base: a well-cut dress in a neutral tone, a tailored trouser, a blouse that survives both an office day and dinner after. These are the pieces that don\u2019t compete for attention \u2014 they make everything you pair them with look considered.',
      'Colour is where a capsule earns its flexibility. Building around two or three anchor tones \u2014 think warm neutrals, deep greige, a single statement accent \u2014 means nearly everything in your closet can be worn together, which quietly removes the daily \u201cwhat do I wear\u201d tax.',
      'The last piece is restraint. Every new item should replace something, not just add to the pile. That discipline is what separates a capsule wardrobe from a small closet \u2014 it\u2019s curated, not just curtailed.',
    ],
  },
  {
    id: '2',
    slug: 'beachwear-trends',
    category: 'Summer Breeze',
    title: 'Unveiling the Hottest Beachwear Trends',
    date: '18 Jan 2025',
    image: '/assets/blog-2.png',
    excerpt: 'From sculptural silhouettes to sun-ready fabrics, here\u2019s what\u2019s defining beachwear this season.',
    body: [
      'Beachwear this season has moved well past the plain one-piece. Sculptural cuts, asymmetric straps and structured silhouettes are giving swimwear the same intentionality as eveningwear \u2014 pieces you\u2019d happily wear from sand to sundowner.',
      'Fabric is doing a lot of the work too. Textured weaves and subtle sheens catch the light differently than flat spandex ever did, which is part of why this season\u2019s pieces photograph as beautifully as they wear.',
      'Cover-ups have quietly become the real style statement. A well-chosen sheer wrap or lightweight kaftan extends a swim look into brunch territory without a full outfit change \u2014 practical for a Lagos or Abuja getaway where the day rarely stays on one setting.',
      'Our advice: invest in one hero piece \u2014 a cut or colour you wouldn\u2019t normally reach for \u2014 and let the rest of your beach edit stay classic. It\u2019s the same capsule logic, just with more sun.',
    ],
  },
  {
    id: '3',
    slug: 'womens-tailoring',
    category: 'Power Dressing',
    title: 'Navigating the World of Women\u2019s Tailoring',
    date: '25 Mar 2025',
    image: '/assets/blog-3.png',
    excerpt: 'A guide to fit, fabric and the small details that separate tailoring that flatters from tailoring that just fits.',
    body: [
      'Good tailoring isn\u2019t about a garment being tight or loose \u2014 it\u2019s about it following your body\u2019s actual lines. Shoulder seams that sit exactly at the shoulder point, a waist that\u2019s nipped where you\u2019re narrowest, a hem that breaks at the right point on the shoe. These are the details that separate \u201cfits\u201d from \u201cflatters.\u201d',
      'Fabric weight matters more than most people expect. A trouser suit in something too light will cling and crease through a Lagos afternoon; too heavy, and it loses its drape by evening. Mid-weight, structured-but-breathable fabrics are the safest starting point for our climate.',
      'Power dressing has also evolved past the stiff, boxy blazer. This season\u2019s tailoring softens the shoulder, trims the silhouette, and leans into colour \u2014 deep rose, sage, warm neutrals \u2014 rather than defaulting to black and navy.',
      'If you take one thing from this: get one piece properly altered before you write off tailoring as \u201cnot for your body.\u201d A single well-fitted blazer will change how you feel about every other piece in your wardrobe.',
    ],
  },
]