import ArticleReader from "@/components/research/ArticleReader";
import { prisma } from "@/lib/db";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
      },
      select: { title: true, summary: true },
    });
    return post
      ? { title: post.title, description: post.summary }
      : { title: "Research article" };
  } catch {
    return { title: "Research article" };
  }
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticleReader slug={(await params).slug} />;
}
