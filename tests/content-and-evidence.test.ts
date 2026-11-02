import test from "node:test";
import assert from "node:assert/strict";
import { articleHtml } from "../src/lib/safe-content";
import { evidenceMime, evidenceIds } from "../src/lib/evidence";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
test("article rendering removes executable content while preserving useful source links", () => {
  const html = articleHtml(
    '<h2>Research</h2><script>steal()</script><img src="https://example.invalid/photo.png" onerror="steal()"><a href="javascript:steal()">bad</a><a href="https://example.invalid/source">Source</a>',
  );
  assert.ok(html.includes("<h2>Research</h2>"));
  assert.ok(html.includes("https://example.invalid/source"));
  assert.ok(!/script|onerror|javascript:/i.test(html));
});
test("private evidence rejects executable formats and invalid attachment selections", () => {
  assert.equal(
    evidenceMime(Buffer.from('<svg onload="alert(1)"></svg>')),
    null,
  );
  assert.equal(evidenceMime(Buffer.from("<html>evil</html>")), null);
  assert.throws(() => evidenceIds(["id", 42]));
  assert.throws(() => evidenceIds(["a", "b", "c", "d", "e", "f"]));
});
test("additive migration preserves legacy user and provider records", async () => {
  const db = await PGlite.create();
  try {
    await db.exec(
      await readFile(
        new URL("./fixtures/legacy-schema.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.exec(
      `INSERT INTO users(id,email,password,"updatedAt") VALUES ('qa-legacy-user','legacy@qa.invalid','synthetic-hash',NOW());INSERT INTO brokers(name,slug,website,updated_at) VALUES ('Legacy QA provider','legacy-qa-provider','https://example.invalid',NOW());`,
    );
    await db.exec(
      await readFile(
        new URL(
          "../prisma/migrations/20261102000000_platform_services/migration.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(await readFile(new URL('../prisma/migrations/20261102001000_homepage_content/migration.sql',import.meta.url),'utf8'));
    assert.equal(
      (
        await db.query<{ count: number }>(
          "SELECT COUNT(*)::int AS count FROM users",
        )
      ).rows[0].count,
      1,
    );
    assert.equal(
      (
        await db.query<{ count: number }>(
          "SELECT COUNT(*)::int AS count FROM brokers",
        )
      ).rows[0].count,
      1,
    );
    assert.ok(
      (await db.query("SELECT * FROM private_evidence")).rows.length === 0,
    );
  } finally {
    await db.close();
  }
});
