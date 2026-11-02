import ArticleEditor from "@/components/research/ArticleEditor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ArticleEditor id={(await params).id} />;
}
