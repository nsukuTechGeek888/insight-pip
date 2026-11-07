import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
const origin = "https://insightpip.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const providerFields = { slug: true, updatedAt: true };
  const [brokers, firms, posts, reviews] = await Promise.all([
    prisma.broker.findMany({ where: { status: "ACTIVE" }, select: providerFields }),
    prisma.propFirm.findMany({ where: { status: "ACTIVE" }, select: providerFields }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED", OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
      select: providerFields,
    }),
    prisma.review.findMany({
      where: { status: "APPROVED", isHidden: false, retractedAt: null,
        OR: [{ broker: { status: "ACTIVE" } }, { propFirm: { status: "ACTIVE" } }] },
      select: { id: true, updatedAt: true },
    }),
  ]);
  const sections = ["", "/brokers", "/prop-firms", "/reviews", "/offers", "/compare", "/blog", "/incidents", "/methodology"];
  return [
    ...sections.map(section => ({ url: origin + section })),
    ...[...brokers.map(row => ({ ...row, section: "brokers" })),
      ...firms.map(row => ({ ...row, section: "prop-firms" })),
      ...posts.map(row => ({ ...row, section: "blog" })),
      ...reviews.map(row => ({ slug: row.id, updatedAt: row.updatedAt, section: "reviews" })),
    ].map(row => ({ url: origin + "/" + row.section + "/" + encodeURIComponent(row.slug), lastModified: row.updatedAt })),
  ];
}
