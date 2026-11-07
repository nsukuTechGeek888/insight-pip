import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { readFile, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

type Handler = (
  r: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) => Promise<Response>;
test(
  "integrated research platform lifecycle uses isolated PostgreSQL storage",
  { timeout: 120000 },
  async (t) => {
    const directory = await mkdtemp(
      path.join(tmpdir(), "insightpip-integration-"),
    );
    const database = await PGlite.create();
    await database.exec(
      await readFile(new URL("./fixtures/schema.sql", import.meta.url), "utf8"),
    );
    const server = new PGLiteSocketServer({
      db: database,
      host: "127.0.0.1",
      port: 0,
      maxConnections: 100,
    });
    await server.start();
    const connection = server.getServerConn();
    process.env.DATABASE_URL = `postgresql://postgres:postgres@${connection}/postgres?connection_limit=1`;
    process.env.JWT_SECRET = randomBytes(48).toString("hex");
    process.env.PRIVATE_STORAGE_DIR = directory;
    process.env.LOCAL_TEST_MODE = "1";
    process.env.APP_URL = "http://localhost:3000";
    delete process.env.SMTP_HOST;
    let disconnect = async () => {};
    try {
      const { prisma } = await import("../src/lib/db");
      disconnect = () => prisma.$disconnect();
      const login = await import("../src/app/api/auth/login/route");
      const me = await import("../src/app/api/auth/me/route");
      const register = await import("../src/app/api/auth/register/route");
      const recovery = await import("../src/app/api/auth/recovery/route");
      const verification =
        await import("../src/app/api/auth/verify-email/route");
      const reviewRoute = await import("../src/app/api/reviews/route");
      const profile = await import("../src/app/api/research/provider/route");
      const evidence = await import("../src/app/api/evidence/route");
      const fileRoute = await import("../src/app/api/evidence/[id]/route");
      const moderation = await import("../src/app/api/admin/moderation/route");
      const users = await import("../src/app/api/admin/users/route");
      const favorites = await import("../src/app/api/user/favorites/route");
      const comparisons = await import("../src/app/api/user/comparisons/route");
      const reports = await import("../src/app/api/reviews/[id]/report/route");
      const appeals = await import("../src/app/api/reviews/[id]/appeal/route");
      const replies = await import("../src/app/api/reviews/[id]/replies/route");
      const password = "Fixture-password-2026";
      const hashed = await bcrypt.hash(password, 10);
      const admin = await prisma.user.create({
        data: {
          email: "admin@qa.invalid",
          name: "QA administrator",
          password: hashed,
          role: "ADMIN",
        },
      });
      const trader = await prisma.user.create({
        data: {
          email: "trader@qa.invalid",
          name: "QA trader",
          password: hashed,
        },
      });
      const other = await prisma.user.create({
        data: {
          email: "other@qa.invalid",
          name: "Another QA trader",
          password: hashed,
        },
      });
      const broker = await prisma.broker.create({
        data: {
          name: "QA fixture broker — synthetic test record",
          slug: "qa-fixture-broker",
          website: "https://example.invalid",
          regions: ["GLOBAL"],
        },
      });
      let adminCookie = "",
        traderCookie = "",
        otherCookie = "",
        evidenceId = "",
        reviewId = "";
      async function call(
        handler: Handler,
        url: string,
        method = "GET",
        body?: unknown,
        cookie = "",
        id = "",
      ) {
        const headers: Record<string, string> = {};
        if (cookie) headers.cookie = cookie;
        let requestBody: BodyInit | undefined;
        if (body instanceof FormData) requestBody = body;
        else if (body !== undefined) {
          headers["content-type"] = "application/json";
          requestBody = JSON.stringify(body);
        }
        return handler(
          new NextRequest("http://localhost:3000" + url, {
            method,
            headers,
            ...(requestBody ? { body: requestBody } : {}),
          }),
          { params: Promise.resolve({ id }) },
        );
      }
      async function authenticated(email: string) {
        const response = await call(login.POST, "/api/auth/login", "POST", {
          email,
          password,
        });
        assert.equal(response.status, 200, await response.clone().text());
        return response.headers
          .get("set-cookie")!
          .match(/auth_token=[^;]+/)![0];
      }
      await t.test(
        "authentication rejects bad credentials and cross-origin requests",
        async () => {
          assert.equal(
            (
              await call(login.POST, "/api/auth/login", "POST", {
                email: trader.email,
                password: "wrong",
              })
            ).status,
            401,
          );
          const r = await login.POST(
            new NextRequest("http://localhost:3000/api/auth/login", {
              method: "POST",
              headers: {
                origin: "https://untrusted.invalid",
                "content-type": "application/json",
              },
              body: JSON.stringify({ email: trader.email, password }),
            }),
          );
          assert.equal(r.status, 403);
          adminCookie = await authenticated(admin.email);
          traderCookie = await authenticated(trader.email);
          otherCookie = await authenticated(other.email);
          assert.equal(
            (await call(me.GET, "/api/auth/me", "GET", undefined, traderCookie))
              .status,
            200,
          );
        },
      );
      await t.test(
        "private evidence validates file contents and denies unauthorised access",
        async () => {
          const bytes = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1kAAAAASUVORK5CYII=",
            "base64",
          );
          const form = new FormData();
          form.set(
            "file",
            new File([bytes], "fixture.png", { type: "image/png" }),
          );
          assert.equal(
            (await call(evidence.POST, "/api/evidence", "POST", form)).status,
            401,
          );
          const r = await call(
            evidence.POST,
            "/api/evidence",
            "POST",
            form,
            traderCookie,
          );
          assert.equal(r.status, 201, await r.clone().text());
          evidenceId = (await r.json()).evidence.id;
          assert.equal(
            (
              await call(
                fileRoute.GET,
                "/api/evidence/" + evidenceId,
                "GET",
                undefined,
                otherCookie,
                evidenceId,
              )
            ).status,
            404,
          );
          const owner = await call(
            fileRoute.GET,
            "/api/evidence/" + evidenceId,
            "GET",
            undefined,
            traderCookie,
            evidenceId,
          );
          assert.equal(owner.status, 200);
          assert.match(owner.headers.get("cache-control")!, /no-store/);
          assert.deepEqual(Buffer.from(await owner.arrayBuffer()), bytes);
          const spoof = new FormData();
          spoof.set(
            "file",
            new File(["%PDF-1.7 invalid png"], "spoof.png", {
              type: "image/png",
            }),
          );
          assert.equal(
            (
              await call(
                evidence.POST,
                "/api/evidence",
                "POST",
                spoof,
                traderCookie,
              )
            ).status,
            400,
          );
        },
      );
      await t.test(
        "reviews remain private until moderated and duplicate submissions are rejected",
        async () => {
          const body = {
            brokerId: broker.id,
            title: "Synthetic test experience",
            content:
              "This is a synthetic QA record used only for automated tests.",
            rating: 4,
            evidenceIds: [evidenceId],
          };
          const r = await call(
            reviewRoute.POST,
            "/api/reviews",
            "POST",
            body,
            traderCookie,
          );
          assert.equal(r.status, 201, await r.clone().text());
          const d = await r.json();
          reviewId = d.id;
          assert.equal(d.status, "PENDING");
          const publicBefore = await call(reviewRoute.GET, "/api/reviews");
          assert.equal((await publicBefore.json()).reviews.length, 0);
          assert.equal(
            (
              await call(
                reviewRoute.POST,
                "/api/reviews",
                "POST",
                { ...body, evidenceIds: [] },
                traderCookie,
              )
            ).status,
            409,
          );
          assert.equal(
            (await prisma.review.findUniqueOrThrow({ where: { id: reviewId } }))
              .isVerified,
            false,
          );
          const approved = await call(
            moderation.POST,
            "/api/admin/moderation",
            "POST",
            {
              id: reviewId,
              action: "approve",
              note: "Inspected synthetic fixture",
            },
            adminCookie,
          );
          assert.equal(approved.status, 200, await approved.clone().text());
          const after = await call(
            profile.GET,
            "/api/research/provider?type=brokers&slug=qa-fixture-broker",
          );
          const research = await after.json();
          assert.equal(research.reviewCount, 1);
          assert.equal(research.rating, 4);
          assert.equal(research.reviews[0]._count.evidence, 1);
          assert.equal("storageKey" in research.reviews[0], false);
        },
      );
      await t.test(
        "experience verification requires reviewed evidence, not email verification",
        async () => {
          const first = await call(
            moderation.POST,
            "/api/admin/moderation",
            "POST",
            {
              id: reviewId,
              action: "verify-experience",
              note: "Independent fixture check",
            },
            adminCookie,
          );
          assert.equal(first.status, 400);
          assert.equal(
            (
              await call(
                moderation.POST,
                "/api/admin/moderation",
                "POST",
                { id: evidenceId, action: "evidence-reviewed" },
                adminCookie,
              )
            ).status,
            200,
          );
          assert.equal(
            (
              await call(
                moderation.POST,
                "/api/admin/moderation",
                "POST",
                {
                  id: reviewId,
                  action: "verify-experience",
                  note: "Independent trading experience evidence checked in fixture",
                },
                adminCookie,
              )
            ).status,
            200,
          );
        },
      );
      await t.test(
        "saved records are owned by the current trader",
        async () => {
          const r = await call(
            favorites.POST,
            "/api/user/favorites",
            "POST",
            { entityType: "broker", entityId: broker.id },
            traderCookie,
          );
          assert.equal(r.status, 201);
          const id = (await r.json()).favorite.id;
          await call(
            favorites.DELETE,
            "/api/user/favorites?id=" + id,
            "DELETE",
            undefined,
            otherCookie,
          );
          assert.equal(await prisma.favorite.count({ where: { id } }), 1);
          const saved = await call(
            comparisons.POST,
            "/api/user/comparisons",
            "POST",
            { name: "Fixture comparison", type: "brokers", ids: [broker.id] },
            traderCookie,
          );
          assert.equal(saved.status, 201);
          const comparison = (await saved.json()).comparison;
          await call(
            comparisons.DELETE,
            "/api/user/comparisons?id=" + comparison.id,
            "DELETE",
            undefined,
            otherCookie,
          );
          assert.equal(
            await prisma.comparison.count({ where: { id: comparison.id } }),
            1,
          );
        },
      );
      await t.test(
        "review reports are deduplicated and rejected reviews can be appealed",
        async () => {
          const r = await call(
            reports.POST,
            "/api/reviews/" + reviewId + "/report",
            "POST",
            { reason: "Synthetic QA report for moderation" },
            otherCookie,
            reviewId,
          );
          assert.equal(r.status, 201, await r.clone().text());
          assert.equal(
            (
              await call(
                reports.POST,
                "/api/reviews/" + reviewId + "/report",
                "POST",
                { reason: "Duplicate synthetic report" },
                otherCookie,
                reviewId,
              )
            ).status,
            409,
          );
          await call(
            moderation.POST,
            "/api/admin/moderation",
            "POST",
            {
              id: reviewId,
              action: "reject",
              note: "Synthetic rejection for appeal test",
            },
            adminCookie,
          );
          const appeal = await call(
            appeals.POST,
            "/api/reviews/" + reviewId + "/appeal",
            "POST",
            { reason: "Please independently review this synthetic decision." },
            traderCookie,
            reviewId,
          );
          assert.equal(appeal.status, 201, await appeal.clone().text());
          const appealId = (await appeal.json()).appeal.id;
          assert.equal(
            (
              await call(
                moderation.POST,
                "/api/admin/moderation",
                "POST",
                {
                  id: appealId,
                  action: "accept-appeal",
                  note: "Reopened after independent appeal review",
                },
                adminCookie,
              )
            ).status,
            200,
          );
          assert.equal(
            (await prisma.review.findUniqueOrThrow({ where: { id: reviewId } }))
              .status,
            "PENDING",
          );
          await call(
            moderation.POST,
            "/api/admin/moderation",
            "POST",
            { id: reviewId, action: "approve" },
            adminCookie,
          );
        },
      );
      await t.test(
        "email addresses cannot impersonate provider representatives; replies require moderation",
        async () => {
          const response = await call(
            replies.POST,
            "/api/reviews/" + reviewId + "/replies",
            "POST",
            { content: "A synthetic trader reply." },
            otherCookie,
            reviewId,
          );
          assert.equal(response.status, 201, await response.clone().text());
          const reply = (await response.json()).reply;
          assert.equal(reply.replyType, "USER");
          assert.equal(reply.isApproved, false);
          const visible = await call(
            replies.GET,
            "/api/reviews/" + reviewId + "/replies",
            "GET",
            undefined,
            "",
            reviewId,
          );
          assert.equal((await visible.json()).replies.length, 0);
          await call(
            moderation.POST,
            "/api/admin/moderation",
            "POST",
            { id: reply.id, action: "approve-reply" },
            adminCookie,
          );
          const published = await call(
            replies.GET,
            "/api/reviews/" + reviewId + "/replies",
            "GET",
            undefined,
            "",
            reviewId,
          );
          assert.equal((await published.json()).replies.length, 1);
        },
      );
      await t.test(
        "suspension revokes current sessions and reactivation requires sign-in",
        async () => {
          const suspended = await call(
            users.PATCH,
            "/api/admin/users",
            "PATCH",
            {
              userId: trader.id,
              action: "suspend",
              reason: "Synthetic access test",
            },
            adminCookie,
          );
          assert.equal(suspended.status, 200, await suspended.clone().text());
          assert.equal(
            (await call(me.GET, "/api/auth/me", "GET", undefined, traderCookie))
              .status,
            401,
          );
          assert.equal(
            (
              await call(login.POST, "/api/auth/login", "POST", {
                email: trader.email,
                password,
              })
            ).status,
            403,
          );
          assert.equal(
            (
              await call(
                users.PATCH,
                "/api/admin/users",
                "PATCH",
                { userId: trader.id, action: "activate" },
                adminCookie,
              )
            ).status,
            200,
          );
          assert.equal(
            (await call(me.GET, "/api/auth/me", "GET", undefined, traderCookie))
              .status,
            401,
          );
          traderCookie = await authenticated(trader.email);
        },
      );
      await t.test(
        "verification and reset links are single-use and password reset revokes sessions",
        async () => {
          const r = await call(register.POST, "/api/auth/register", "POST", {
            name: "QA new trader",
            email: "new@qa.invalid",
            password,
          });
          assert.equal(r.status, 201, await r.clone().text());
          let messages = await Promise.all(
            (await readdir(path.join(directory, "mail"))).map(async (name) =>
              JSON.parse(
                await readFile(path.join(directory, "mail", name), "utf8"),
              ),
            ),
          );
          const verify = messages.find((m) => m.to === "new@qa.invalid");
          assert.ok(verify);
          const verificationToken =
            verify.text.match(/token=([a-f0-9]{64})/)[1];
          assert.equal(
            (
              await call(verification.POST, "/api/auth/verify-email", "POST", {
                token: verificationToken,
              })
            ).status,
            200,
          );
          assert.equal(
            (
              await call(verification.POST, "/api/auth/verify-email", "POST", {
                token: verificationToken,
              })
            ).status,
            400,
          );
          const request = await call(
            recovery.POST,
            "/api/auth/recovery",
            "POST",
            { email: trader.email },
          );
          assert.equal(request.status, 200);
          messages = await Promise.all(
            (await readdir(path.join(directory, "mail"))).map(async (name) =>
              JSON.parse(
                await readFile(path.join(directory, "mail", name), "utf8"),
              ),
            ),
          );
          const reset = messages.find((m) => m.to === trader.email);
          const token = reset.text.match(/token=([a-f0-9]{64})/)[1];
          assert.equal(
            (
              await call(recovery.PUT, "/api/auth/recovery", "PUT", {
                token,
                password: "Changed-fixture-password-2026",
              })
            ).status,
            200,
          );
          assert.equal(
            (
              await call(recovery.PUT, "/api/auth/recovery", "PUT", {
                token,
                password: "Another-fixture-password-2026",
              })
            ).status,
            400,
          );
          assert.equal(
            (await call(me.GET, "/api/auth/me", "GET", undefined, traderCookie))
              .status,
            401,
          );
        },
      );
      await t.test(
        "incident moderation separates allegations, resolution and community responses",
        async () => {
          const incidentRoute = await import("../src/app/api/incidents/route");
          const detail = await import("../src/app/api/incidents/[id]/route");
          const adminIncident =
            await import("../src/app/api/admin/incidents/[id]/route");
          const confirm =
            await import("../src/app/api/incidents/[id]/confirm/route");
          const response = await call(
            incidentRoute.POST,
            "/api/incidents",
            "POST",
            {
              entityType: "broker",
              entityId: broker.id,
              incidentType: "WITHDRAWAL_DELAY",
              title: "Synthetic QA incident",
              description:
                "A fictional incident for testing moderation and privacy.",
              incidentDate: new Date().toISOString(),
            },
            otherCookie,
          );
          assert.equal(response.status, 201, await response.clone().text());
          const incident = (await response.json()).incident;
          assert.ok(incident.id);
          assert.equal(
            (
              await call(
                detail.GET,
                "/api/incidents/" + incident.id,
                "GET",
                undefined,
                "",
                incident.id,
              )
            ).status,
            404,
          );
          assert.equal(
            (
              await call(
                adminIncident.PATCH,
                "/api/admin/incidents/" + incident.id,
                "PATCH",
                {
                  action: "approve",
                  note: "Synthetic report reviewed for publication",
                },
                adminCookie,
                incident.id,
              )
            ).status,
            200,
          );
          const publicReport = await call(
            detail.GET,
            "/api/incidents/" + incident.id,
            "GET",
            undefined,
            "",
            incident.id,
          );
          const result = (await publicReport.json()).incident;
          assert.equal(result.verifiedBadge, false);
          assert.deepEqual(result.evidence, []);
          assert.equal("proofUrls" in result, false);
          await call(
            confirm.POST,
            "/api/incidents/" + incident.id + "/confirm",
            "POST",
            undefined,
            adminCookie,
            incident.id,
          );
          await call(
            confirm.POST,
            "/api/incidents/" + incident.id + "/confirm",
            "POST",
            undefined,
            adminCookie,
            incident.id,
          );
          assert.equal(
            (
              await prisma.incident.findUniqueOrThrow({
                where: { id: incident.id },
              })
            ).confirmations,
            1,
          );
          assert.equal(
            (
              await call(
                adminIncident.PATCH,
                "/api/admin/incidents/" + incident.id,
                "PATCH",
                {
                  action: "verify",
                  note: "Attempt without independently checked evidence",
                },
                adminCookie,
                incident.id,
              )
            ).status,
            400,
          );
          await call(
            adminIncident.PATCH,
            "/api/admin/incidents/" + incident.id,
            "PATCH",
            {
              action: "resolve",
              note: "Synthetic issue resolved independently of fact verification",
            },
            adminCookie,
            incident.id,
          );
          assert.equal(
            (
              await prisma.incident.findUniqueOrThrow({
                where: { id: incident.id },
              })
            ).verifiedBadge,
            false,
          );
        },
      );
      await t.test(
        "offers and source references use provider records and expired offers disappear",
        async () => {
          const management =
            await import("../src/app/api/admin/research/route");
          const publicOffers =
            await import("../src/app/api/research/offers/route");
          const source = {
            kind: "source",
            entityType: "brokers",
            entityId: broker.id,
            category: "Company information",
            label: "Synthetic QA source",
            url: "https://example.invalid/source",
            note: "Fictional test source, not a regulatory claim",
          };
          assert.equal(
            (
              await call(
                management.POST,
                "/api/admin/research",
                "POST",
                source,
                traderCookie,
              )
            ).status,
            401,
          );
          assert.equal(
            (
              await call(
                management.POST,
                "/api/admin/research",
                "POST",
                source,
                adminCookie,
              )
            ).status,
            201,
          );
          const offer = await call(
            management.POST,
            "/api/admin/research",
            "POST",
            {
              kind: "offer",
              entityType: "brokers",
              entityId: broker.id,
              name: "Synthetic QA promotion",
              description:
                "Illustrative offer terms for testing only. No real commercial offer.",
              validUntil: new Date(Date.now() + 86400000).toISOString(),
              regions: ["GLOBAL"],
              restrictedRegions: ["SA"],
            },
            adminCookie,
          );
          assert.equal(offer.status, 201, await offer.clone().text());
          const id = (await offer.json()).record.id;
          const available = await call(
            publicOffers.GET,
            "/api/research/offers?region=GLOBAL",
          );
          assert.equal((await available.json()).offers.length, 1);
          assert.equal(
            (
              await (
                await call(publicOffers.GET, "/api/research/offers?region=SA")
              ).json()
            ).offers.length,
            0,
          );
          await call(
            management.DELETE,
            `/api/admin/research?kind=offer&type=brokers&id=${id}`,
            "DELETE",
            undefined,
            adminCookie,
          );
          assert.equal(
            (
              await (
                await call(
                  publicOffers.GET,
                  "/api/research/offers?region=GLOBAL",
                )
              ).json()
            ).offers.length,
            0,
          );
        },
      );
      await t.test(
        "editorial drafts and scheduled articles stay private; published HTML is sanitised",
        async () => {
          const content = await import("../src/app/api/admin/blog/route");
          const publicContent = await import("../src/app/api/blog/route");
          const post = {
            title: "Synthetic QA article",
            slug: "synthetic-qa-article",
            summary:
              "A fictional article for testing public content boundaries.",
            content:
              "<h2>Fixture research</h2><p>Useful synthetic text for the QA reader.</p><script>alert(1)</script>",
            category: "QA",
            tags: ["synthetic"],
            status: "DRAFT",
          };
          const created = await call(
            content.POST,
            "/api/admin/blog",
            "POST",
            post,
            adminCookie,
          );
          assert.equal(created.status, 201, await created.clone().text());
          const saved = (await created.json()).post;
          assert.ok(!saved.content.includes("<script"));
          assert.equal(
            (
              await (
                await call(publicContent.GET, "/api/blog?status=DRAFT")
              ).json()
            ).posts.length,
            0,
          );
          await call(
            content.PUT,
            "/api/admin/blog",
            "PUT",
            {
              ...post,
              postId: saved.id,
              status: "PUBLISHED",
              publishedAt: new Date(Date.now() + 86400000).toISOString(),
            },
            adminCookie,
          );
          assert.equal(
            (await (await call(publicContent.GET, "/api/blog")).json()).posts
              .length,
            0,
          );
          await call(
            content.PUT,
            "/api/admin/blog",
            "PUT",
            { postId: saved.id, action: "publish" },
            adminCookie,
          );
          assert.equal(
            (
              await (
                await call(publicContent.GET, "/api/blog?search=Synthetic")
              ).json()
            ).posts.length,
            1,
          );
        },
      );
      await t.test('provider administration preserves offering identities and rolls back invalid changes',async()=>{
 const management=await import('../src/app/api/admin/brokers/route');const edit=await import('../src/app/api/admin/brokers/[id]/route');
 const created=await call(management.POST,'/api/admin/brokers','POST',{name:'Second QA provider',website:'https://example.invalid',accountTypes:[{name:'QA account',minDeposit:'100',swapFree:false}]},adminCookie);assert.equal(created.status,201,await created.clone().text());const provider=(await created.json()).broker;const account=provider.accountTypes[0];
 const updated=await call(edit.PUT,'/api/admin/brokers/'+provider.id,'PUT',{name:provider.name,website:provider.website,status:'ACTIVE',accountTypes:[{...account,minDeposit:'200'}]},adminCookie,String(provider.id));assert.equal(updated.status,200,await updated.clone().text());assert.equal((await updated.json()).broker.accountTypes[0].id,account.id);
 const failed=await call(edit.PUT,'/api/admin/brokers/'+provider.id,'PUT',{name:'Changed name must roll back',website:provider.website,status:'ACTIVE',accountTypes:[{id:999999,name:'Foreign account'}]},adminCookie,String(provider.id));assert.equal(failed.status,500);assert.equal((await prisma.broker.findUniqueOrThrow({where:{id:provider.id}})).name,provider.name);
 assert.equal((await call(management.DELETE,'/api/admin/brokers?id='+provider.id,'DELETE',undefined,adminCookie)).status,200);assert.equal((await prisma.broker.findUniqueOrThrow({where:{id:provider.id}})).status,'INACTIVE');assert.equal(await prisma.brokerAccountType.count({where:{brokerId:provider.id}}),1);
 const result=await (await call(management.GET,'/api/admin/brokers?limit=1&page=1','GET',undefined,adminCookie)).json();assert.equal(result.brokers.length,1);assert.equal(result.pagination.total,2);
});
await t.test('homepage content persists with audited featured selection',async()=>{const cms=await import('../src/app/api/admin/homepage/route');const publicHome=await import('../src/app/api/research/homepage/route');const {defaultHomepage}=await import('../src/lib/homepage');const response=await call(cms.PUT,'/api/admin/homepage','PUT',{content:{...defaultHomepage,headline:'Synthetic QA homepage content'},featured:[{type:'brokers',id:broker.id}]},adminCookie);assert.equal(response.status,200,await response.clone().text());assert.equal((await (await publicHome.GET()).json()).content.headline,'Synthetic QA homepage content');assert.equal((await prisma.broker.findUniqueOrThrow({where:{id:broker.id}})).isRecommended,true);});
await t.test('rankings aggregate published ratings and admin totals count the complete database',async()=>{
 await prisma.review.create({data:{userId:admin.id,brokerId:broker.id,title:'Synthetic rating two',content:'Fictional QA rating for aggregate tests only.',rating:5,status:'APPROVED',isApproved:true}});await prisma.review.create({data:{userId:other.id,brokerId:broker.id,title:'Synthetic rating three',content:'Fictional QA rating for aggregate tests only.',rating:1,status:'APPROVED',isApproved:true}});
 const ranking=await import('../src/app/api/research/rankings/route');const d=await (await call(ranking.GET,'/api/research/rankings?type=brokers')).json();assert.equal(d.rows.length,1,JSON.stringify(d));assert.equal(d.rows[0].reviews,3);assert.ok(Math.abs(d.rows[0].rating-10/3)<0.0001);
 const stats=await import('../src/app/api/admin/stats/route');assert.equal((await call(stats.GET,'/api/admin/stats')).status,401);const response=await call(stats.GET,'/api/admin/stats','GET',undefined,adminCookie);assert.equal(response.status,200,await response.clone().text());const values=await response.json();assert.equal(values.stats.users,4);assert.equal(values.stats.activeProviders,1);assert.equal(values.stats.publishedReviews,3);assert.equal(values.growth.length,30);
});
await t.test(
        "notifications and audit history persist with direct content links",
        async () => {
          const notices = await prisma.notification.findMany({
            where: { userId: trader.id },
          });
          assert.ok(notices.length >= 3);
          assert.ok(notices.every((n) => n.href.startsWith("/")));
          assert.ok((await prisma.auditEvent.count()) > 10);
          assert.equal(
            await prisma.privateEvidence.count({ where: { reviewId } }),
            1,
          );
          assert.equal(await prisma.broker.count(), 2);
          assert.equal(await prisma.user.count(), 4);
        },
      );
      await t.test("provider imports preserve existing records and roll back invalid offerings", async () => {
        const brokers = await import("../src/app/api/admin/brokers/import/route");
        const firms = await import("../src/app/api/admin/prop-firms/import/route");
        for (const [type, handler] of [["brokers", brokers.POST], ["prop-firms", firms.POST]] as const) {
          const url = "/api/admin/" + type + "/import";
          const name = "QA import " + type;
          const payload = { name, website: "https://example.invalid", signupLink: "https://example.invalid/partner?ref=qa" };
          assert.equal((await call(handler, url, "POST", payload)).status, 401);
          const submit = async (body: unknown) => (await call(handler, url, "POST", body, adminCookie)).json();
          const invalid = type === "brokers" ? { accountTypes: [null] } : { programs: [null] };
          assert.equal((await submit({ ...payload, ...invalid })).imported, 0);
          assert.equal((await submit(payload)).imported, 1);
          assert.equal((await submit({ ...payload, website: "https://changed.invalid" })).imported, 0);
          const record = type === "brokers" ? await prisma.broker.findFirstOrThrow({ where: { name } }) : await prisma.propFirm.findFirstOrThrow({ where: { name } });
          assert.equal(record.website, payload.website);
          assert.equal(record.signupLink, payload.signupLink);
          assert.equal(record.status, "INACTIVE");
        }
      });
      await t.test("admin logo upload stores the image returned by its public URL", async () => {
        const upload = await import("../src/app/api/upload/route");
        const bytes = await readFile("public/favicon-16x16.png");
        const form = new FormData();
        form.append("file", new File([new Uint8Array(bytes)], "logo.png", { type: "image/png" }));
        form.append("type", "broker");
        assert.equal((await call(upload.POST, "/api/upload", "POST", form)).status, 401);
        const result = await call(upload.POST, "/api/upload", "POST", form, adminCookie);
        assert.equal(result.status, 200);
        const { url } = await result.json();
        assert.match(url, /^\/uploads\/broker\/[a-f0-9-]+\.png$/);
        try {
          const media = await import("../src/app/uploads/[kind]/[filename]/route");
          const image = await media.GET(new Request("http://localhost" + url), { params: Promise.resolve({ kind: "broker", filename: path.basename(url) }) });
          assert.equal(image.headers.get("Content-Type"), "image/png");
          assert.deepEqual(Buffer.from(await image.arrayBuffer()), bytes);
        }
        finally { await rm(path.join("public", url)); }
      });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      await disconnect();
      await server.stop();
      await database.close();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
