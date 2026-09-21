import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/shop-actions";
import { ProductDetail } from "./product-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  return { title: data ? `${data.product.name} - maxopc` : "Product - maxopc" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) notFound();

  return <ProductDetail product={data.product} skus={data.skus} />;
}
