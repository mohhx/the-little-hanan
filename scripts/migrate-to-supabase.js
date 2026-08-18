// scripts/migrate-to-supabase.js
//
// One-time migration: uploads the images referenced in lib/seedData.js to
// Supabase Storage, then upserts categories/products/blog_posts rows with
// the resulting public URLs.
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (service role bypasses
// RLS so this script can write — never used anywhere else in the app).
//
// Run: node scripts/migrate-to-supabase.js

require('dotenv').config({ path: '.env.local' })

// Node resolves DNS as IPv6-first by default. On some Windows networks
// IPv6 connectivity is flaky or blocked, which makes global fetch() throw
// a generic "fetch failed" with no useful detail. Forcing IPv4 first
// avoids that entirely.
require('dns').setDefaultResultOrder('ipv4first')

// @supabase/supabase-js initializes a realtime/websocket client on
// creation, which expects a global `WebSocket` — standard in browsers,
// but Node < 22 doesn't have one built in. This script never uses
// realtime, so a minimal polyfill is enough to get past initialization.
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = require('ws')
}
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '\nMissing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.\n' +
    'Get the service role key from Supabase → Project Settings → API, then re-run.\n'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const PUBLIC_DIR = path.join(__dirname, '..', 'public')

// Uploads a local file (path relative to /public, e.g. "/assets/product-1.jpg")
// to the given bucket, and returns its public URL. Skips the upload if a
// file with the same name already exists in the bucket (safe to re-run).
async function uploadImage(bucket, localPublicPath) {
  const filename = path.basename(localPublicPath)
  const fileBuffer = fs.readFileSync(path.join(PUBLIC_DIR, localPublicPath))
  const ext = path.extname(filename).slice(1).toLowerCase()
  const contentType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream'

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, fileBuffer, { contentType, upsert: true })

  if (error) {
    throw new Error(`Failed to upload ${localPublicPath} to ${bucket}: ${error.message}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

async function main() {
  const { PRODUCTS, CATEGORIES, BLOG_POSTS } = await import('../lib/seedData.js')

  // ── Categories ──
  console.log(`Uploading ${CATEGORIES.length} category images...`)
  const categoryRows = []
  for (const cat of CATEGORIES) {
    const imageUrl = await uploadImage('category-images', cat.image)
    categoryRows.push({ slug: cat.slug, name: cat.name, image: imageUrl })
    console.log(`  ✓ ${cat.name}`)
  }
  const { error: catError } = await supabase
    .from('categories')
    .upsert(categoryRows, { onConflict: 'slug' })
  if (catError) throw new Error(`Insert categories failed: ${catError.message}`)
  console.log(`Categories done.\n`)

  // ── Products ── (some products share an image — cache by local path so
  // we don't upload the same file twice)
  console.log(`Uploading product images (${PRODUCTS.length} products)...`)
  const uploadedImages = new Map()
  const productRows = []
  for (const p of PRODUCTS) {
    let imageUrl = uploadedImages.get(p.image)
    if (!imageUrl) {
      imageUrl = await uploadImage('product-images', p.image)
      uploadedImages.set(p.image, imageUrl)
    }
    productRows.push({
      slug: p.slug,
      name: p.name,
      price: p.price,
      original_price: p.originalPrice ?? null,
      category: p.category,
      rating: p.rating,
      image: imageUrl,
    })
    console.log(`  ✓ ${p.name}`)
  }
  const { error: prodError } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'slug' })
  if (prodError) throw new Error(`Insert products failed: ${prodError.message}`)
  console.log(`Products done.\n`)

  // ── Blog posts ──
  console.log(`Uploading ${BLOG_POSTS.length} blog images...`)
  const blogRows = []
  for (const post of BLOG_POSTS) {
    const imageUrl = await uploadImage('blog-images', post.image)
    blogRows.push({
      slug: post.slug,
      title: post.title,
      category: post.category,
      date: post.date,
      image: imageUrl,
      excerpt: post.excerpt,
      body: post.body,
    })
    console.log(`  ✓ ${post.title}`)
  }
  const { error: blogError } = await supabase
    .from('blog_posts')
    .upsert(blogRows, { onConflict: 'slug' })
  if (blogError) throw new Error(`Insert blog_posts failed: ${blogError.message}`)
  console.log(`Blog posts done.\n`)

  console.log('Migration complete. Check the Supabase Table Editor and Storage tabs to confirm.')
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message)
  process.exit(1)
})