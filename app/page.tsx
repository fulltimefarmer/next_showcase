import { getCategories, getProducts } from "./shop-actions";
import { ProductCatalog } from "./product-catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <main>
      <section className="hidden border-b border-slate-200 bg-white lg:block">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            maxopc small e-commerce demo
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
            A small e-commerce project for showcasing and purchasing products.
            Browse categories, pick your favorites, and enjoy a complete
            shopping experience.
          </p>
        </div>
      </section>

      <ProductCatalog categories={categories} products={products} />
    </main>
  );
}
