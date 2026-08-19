import Hero from '../../components/sections/Hero';
import Categories from '../../components/sections/Categories';
import ProductGrid from '../../components/sections/ProductGrid';
import WhimsyTeaser from '../../components/sections/WhimsyTeaser';
import FAQSection from '../../components/sections/FAQSection';
import {
  DealsSection,
  TrustBanner,
  BlogSection,
} from '../../components/sections/Sections';
import { getProducts, getCategories, getBlogPosts, getDealsReelProducts, getWhimsyProducts } from '../../lib/products';

export default async function HomePage() {
  const [products, categories, blogPosts, dealsReelProducts, whimsyProducts] = await Promise.all([
    getProducts(),
    getCategories(),
    getBlogPosts(),
    getDealsReelProducts(),
    getWhimsyProducts(),
  ]);
  // WhimsyNetting gets its own dedicated section (WhimsyTeaser) further down
  // this page, so it's left out of the tile grid to avoid showing it twice.
  const tileCategories = categories.filter((c) => c.slug !== 'whimsynetting');

  return (
    <main>
      <Hero />
      <Categories categories={tileCategories} />
      <ProductGrid products={products} />
      <DealsSection products={dealsReelProducts} />
      <WhimsyTeaser products={whimsyProducts} />
      <TrustBanner />
      <FAQSection />
      <BlogSection posts={blogPosts} />
    </main>
  );
}