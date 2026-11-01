import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const host = new URL(base).hostname;
if (!["localhost", "127.0.0.1", "terminal.local"].includes(host))
  throw Error("Smoke tests must target a local development server.");
const pages = [
  "/",
  "/brokers",
  "/prop-firms",
  "/reviews",
  "/reviews/write",
  "/incidents",
  "/compare",
  "/offers",
  "/blog",
  "/login",
  "/signup",
  "/methodology",
  "/search?q=test",
];
let passed = 0;
for (const page of pages) {
  const r = await fetch(base + page);
  assert.equal(r.status, 200, page);
  const html = await r.text();
  assert.ok(html.includes("InsightPip"), page);
  console.log(`PASS page ${page}`);
  passed++;
}
for (const [path, status, method, body] of [
  ["/api/auth/me", 401, "GET"],
  ["/api/admin/stats", 401, "GET"],
  ["/api/research/compare?ids=1,2,3,4", 400, "GET"],
  ["/api/research/compare?ids=abc", 400, "GET"],
  ["/api/brokers", 403, "POST", {}],
  ["/api/prop-firms", 403, "POST", {}],
  ["/api/reviews", 401, "POST", {}],
  ["/api/reviews/test/report", 401, "POST", { reason: "Test only" }],
]) {
  const r = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal(r.status, status, path);
  console.log(`PASS boundary ${method} ${path}: ${status}`);
  passed++;
}
const admin = await fetch(base + "/admin", { redirect: "manual" });
assert.equal(admin.status, 307);
assert.ok(admin.headers.get("location")?.includes("/login"));
passed++;
console.log(
  `PASS admin redirects unauthenticated visitors\n${passed} smoke checks passed. No database writes were authorised.`,
);
