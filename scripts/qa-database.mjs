import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaClient } from "@prisma/client";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import bcrypt from "bcryptjs";
export async function startQaDatabase() {
  if(process.env.NODE_ENV==="production")throw Error("QA mode is available only in development");
  const directory = path.resolve(".private/qa");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const db = await PGlite.create(path.join(directory, "database"));
  const existing = await db.query(
    "SELECT to_regclass('public.users') AS existing",
  );
  if (!existing.rows[0].existing)
    await db.exec(
      await readFile(path.resolve("tests/fixtures/schema.sql"), "utf8"),
    );
  const settings=await db.query("SELECT to_regclass('public.platform_settings') AS existing");
  if(!settings.rows[0].existing)await db.exec(await readFile(path.resolve('prisma/migrations/20261102001000_homepage_content/migration.sql'),'utf8'));
  const server = new PGLiteSocketServer({
    db,
    host: "127.0.0.1",
    port: 0,
    maxConnections: 100,
  });
  await server.start();
  const url = `postgresql://postgres:postgres@${server.getServerConn()}/postgres?connection_limit=1&pgbouncer=true&statement_cache_size=0`;
  process.env.DATABASE_URL = url;
  process.env.JWT_SECRET =
    process.env.JWT_SECRET || randomBytes(48).toString("hex");
  process.env.NEXTAUTH_SECRET =
    process.env.NEXTAUTH_SECRET || randomBytes(48).toString("hex");
  process.env.LOCAL_TEST_MODE = "1";
  process.env.NEXT_PUBLIC_QA_MODE = "1";
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const accessFile = path.join(directory, "access.json");
  let access;
  try {
    access = JSON.parse(await readFile(accessFile, "utf8"));
  } catch {
    access = {
      admin: {
        email: "admin@insightpip-qa.invalid",
        password: randomBytes(18).toString("base64url"),
      },
      trader: {
        email: "trader@insightpip-qa.invalid",
        password: randomBytes(18).toString("base64url"),
      },
    };
    await writeFile(accessFile, JSON.stringify(access, null, 2), {
      mode: 0o600,
    });
  }
  const accounts = {};
  for (const [role, credentials] of Object.entries(access)) {
    accounts[role] = await prisma.user.upsert({
      where: { email: credentials.email },
      create: {
        name: role === "admin" ? "QA administrator" : "QA trader",
        email: credentials.email,
        password: await bcrypt.hash(credentials.password, 12),
        role: role === "admin" ? "ADMIN" : "USER",
        security: { create: { emailVerifiedAt: new Date() } },
      },
      update: {},
    });
  }
  if ((await prisma.broker.count()) === 0) {
    const brokers = [];
    for (let i = 1; i <= 3; i++)
      brokers.push(
        await prisma.broker.create({
          data: {
            name: `Example Broker ${i} · QA fixture`,
            slug: `qa-example-broker-${i}`,
            website: "https://example.invalid",
            shortDescription:
              "Fictional provider for local application evaluation. This is not a real broker.",
            description:
              "This fictional research record exists only in the isolated QA database. All example account conditions and trader experiences are test fixtures. Do not use this record to make financial decisions.",
            headquarters: "Fictional QA location",
            platforms: ["QA Trading Platform"],
            regions: ["GLOBAL"],
            accountTypes: {
              create: [
                {
                  name: "Example standard account (QA)",
                  minDeposit: 100,
                  commission:
                    "Example commission: not applicable to a real provider",
                  spreadType: "Illustrative variable spread",
                },
                {
                  name: "Example professional account (QA)",
                  minDeposit: 500,
                  commission: "Illustrative commission",
                  spreadType: "Illustrative raw spread",
                },
              ],
            },
          },
        }),
      );
    for (let i = 1; i <= 3; i++)
      await prisma.propFirm.create({
        data: {
          name: `Example Funding Firm ${i} · QA fixture`,
          slug: `qa-example-firm-${i}`,
          website: "https://example.invalid",
          shortDescription:
            "Fictional funding firm for isolated local testing.",
          description:
            "This is a synthetic QA record. Program rules below are fictional test values, not financial information.",
          regions: ["GLOBAL"],
          platforms: ["QA Trading Platform"],
          programs: {
            create: [
              {
                name: "Example two-step challenge (QA)",
                type: "TWO_STEP",
                rules: {
                  profitTargetPhase1: "Illustrative 8%",
                  profitTargetPhase2: "Illustrative 5%",
                  dailyDrawdown: "Illustrative 5%",
                  overallDrawdown: "Illustrative 10%",
                  drawdownMethod: "Fictional static model",
                  profitSplit: "Illustrative 80%",
                  newsTrading: "Illustrative restriction; not a real rule",
                },
                accountOptions: [
                  {
                    name: "Example 25k (QA)",
                    accountSize: 25000,
                    price: "Illustrative 150 USD",
                  },
                  {
                    name: "Example 50k (QA)",
                    accountSize: 50000,
                    price: "Illustrative 250 USD",
                  },
                ],
              },
            ],
          },
        },
      });
    const review = await prisma.review.create({
      data: {
        userId: accounts.trader.id,
        brokerId: brokers[0].id,
        title: "Fictional QA review — layout evaluation",
        content:
          "This is a synthetic review used to evaluate the interface and moderation workflow. It describes no real trading experience.",
        rating: 4,
        platformStability: 4,
        customerSupport: 3,
        status: "APPROVED",
        isApproved: true,
      },
    });
    await prisma.review.create({
      data: {
        userId: accounts.trader.id,
        brokerId: brokers[1].id,
        title: "Pending QA submission",
        content:
          "This synthetic review is waiting for an administrator to inspect it. Use the moderation queue to approve or reject it.",
        rating: 2,
        status: "PENDING",
      },
    });
    await prisma.incident.create({
      data: {
        userId: accounts.trader.id,
        brokerId: brokers[0].id,
        entityId: brokers[0].id,
        entityType: "broker",
        incidentType: "WITHDRAWAL_DELAY",
        title: "Fictional QA incident — no real allegation",
        description:
          "This is a synthetic incident report for testing the application. It does not allege anything about a real provider.",
        incidentDate: new Date(),
        proofUrls: [],
        status: "PENDING",
      },
    });
    await prisma.notification.create({
      data: {
        userId: accounts.trader.id,
        title: "Your QA workspace is ready",
        body: "These fictional records let you evaluate real application workflows without production access.",
        href: "/dashboard/reviews",
      },
    });
    await prisma.blogPost.create({
      data: {
        title: "Welcome to the isolated QA research library",
        slug: "qa-research-library",
        summary:
          "A fictional editorial record for evaluating article reading, editing and publication workflows.",
        content:
          "<h2>Evaluate with confidence</h2><p>This article belongs to an isolated QA database. It contains no financial advice or provider claims.</p><h2>Try the connected workflows</h2><p>Browse providers, save comparisons, submit a review and inspect moderation decisions from the administrator account.</p>",
        category: "QA documentation",
        tags: ["QA fixture"],
        authorId: accounts.admin.id,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    await prisma.auditEvent.create({
      data: {
        action: "QA_FIXTURES_CREATED",
        entityType: "development",
        entityId: review.id,
      },
    });
  }
  await prisma.$disconnect();
  console.log(
    "Isolated QA database ready. Fictional test data only. Local access details: .private/qa/access.json",
  );
  return async () => {
    await server.stop();
    await db.close();
  };
}
