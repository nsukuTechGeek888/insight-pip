import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { sessionSecret } from "../src/lib/session-secret";
import { isAvailableInRegion, getRegionEntityName } from "../src/lib/region";

test("missing or short JWT secrets fail closed; explicit strong secrets are used", () => {
  const before = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assert.throws(sessionSecret);
    process.env.JWT_SECRET = "short";
    assert.throws(sessionSecret);
    const secret = randomBytes(32).toString("hex");
    process.env.JWT_SECRET = secret;
    assert.equal(sessionSecret(), secret);
  } finally {
    if (before === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = before;
  }
});
test("regional restrictions take priority over global availability", () => {
  assert.equal(
    isAvailableInRegion(
      { regions: ["GLOBAL"], restrictedRegions: ["SA"] },
      "SA",
    ),
    false,
  );
  assert.equal(
    isAvailableInRegion(
      { regions: ["GLOBAL"], restrictedRegions: ["SA"] },
      "UK",
    ),
    true,
  );
  assert.equal(isAvailableInRegion({ regions: ["UK"] }, "SA"), false);
});
test("regional entity mapping accepts stored JSON and rejects invalid claims", () => {
  assert.equal(
    getRegionEntityName(
      { entityMapping: '{"SA":"Local entity","GLOBAL":"Global entity"}' },
      "SA",
    ),
    "Local entity",
  );
  assert.equal(
    getRegionEntityName({ entityMapping: { GLOBAL: "Global entity" } }, "UK"),
    "Global entity",
  );
  assert.equal(getRegionEntityName({ entityMapping: { SA: 123 } }, "SA"), null);
  assert.equal(getRegionEntityName({ entityMapping: "invalid" }, "SA"), null);
});

test('new password hashes distinguish Unicode suffixes beyond bcrypt’s legacy byte limit',async()=>{const {hashPassword,verifyPassword}=await import('../src/lib/passwords');const password='🔐'.repeat(20)+'first';const hash=await hashPassword(password);assert.equal(await verifyPassword(password,hash),true);assert.equal(await verifyPassword('🔐'.repeat(20)+'different',hash),false);});
