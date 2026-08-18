// lib/products.js
// Supabase-backed data layer. Replaces the old static exports — same
// field shapes (camelCase originalPrice, etc.) as before, so consuming
// components don't need to change how they read a product/post/category,
// only how they fetch the list (now async).
import { supabase } from './supabaseClient'

function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    originalPrice: row.original_price,
    category: row.category,
    rating: row.rating,
    image: row.image,
    description: row.description,
    inStock: row.in_stock !== false,
    createdAt: row.created_at,
    fabric: row.fabric,
    fit: row.fit,
    careInstructions: row.care_instructions,
    measurements: row.measurements,
  }
}

function mapCategory(row) {
  return {
    name: row.name,
    image: row.image,
    slug: row.slug,
  }
}

function mapBlogPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    title: row.title,
    date: row.date,
    image: row.image,
    excerpt: row.excerpt,
    body: row.body,
    instagram_url: row.instagram_url,
  }
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProducts failed:', error.message)
    return []
  }
  return data.map(mapProduct)
}
// Products currently on sale — anything with a real original_price higher
// than the current price. Used by the homepage Deals section instead of
// the old static promo-only version.
export async function getDealProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getDealProducts failed:', error.message)
    return []
  }
  return data
    .map(mapProduct)
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
}
// Homepage Deals filmstrip — real on-sale products only, capped at 6 for
// the reel. Deliberately NO fabricated discounts and NO random backfill:
// if the catalog has fewer than 6 real deals, the reel just shows fewer
// frames. (Decided explicitly — do not reintroduce backfill without asking.)
export async function getDealsReelProducts() {
  const deals = await getDealProducts()
  return deals.slice(0, 6)
}
// WhimsyNetting products for the homepage teaser section. NOTE: products.category
// stores the category's display NAME (e.g. "WhimsyNetting"), not its slug —
// confirmed against ProductForm.js (option value={cat.name}) and the shop
// page's existing `product.category === 'WhimsyNetting'` check — so this
// matches on the exact name, same as the rest of the app already does.
export async function getWhimsyProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'WhimsyNetting')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getWhimsyProducts failed:', error.message)
    return []
  }
  return data.map(mapProduct)
}
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('getProductBySlug failed:', error.message)
    return null
  }
  return data ? mapProduct(data) : null
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getCategories failed:', error.message)
    return []
  }
  return data.map(mapCategory)
}

export async function getBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getBlogPosts failed:', error.message)
    return []
  }
  return data.map(mapBlogPost)
}

export async function getBlogPostBySlug(slug) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('getBlogPostBySlug failed:', error.message)
    return null
  }
  return data ? mapBlogPost(data) : null
}