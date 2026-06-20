import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import {
  API_ORIGIN,
  WEB_ORIGIN,
  api,
  qaEmail,
  STRONG_PASSWORD,
  warmUpBackend,
} from './live-config';

/**
 * SECURITY (black-box, live deployment).
 *
 * Probes the deployed system the way an unauthenticated attacker would: from
 * the outside, over HTTPS, with no knowledge of server internals or secrets.
 * Covers authentication, input validation, injection, broken object-level
 * authorization (IDOR), role-based access control, and transport/security
 * headers. A handful of probes are INFORMATIONAL: they record the current
 * posture (rate limiting, info-leak headers) and are written up as findings in
 * the testing report rather than hard gates.
 *
 * Run with: npm run test:live
 */
describe('NaviMart — Security (live deployment)', () => {
  const apiSrv = request(API_ORIGIN);
  const web = request(WEB_ORIGIN);

  // Two independent families to prove cross-tenant isolation (IDOR).
  let tokenA: string;
  let itemIdA: string;
  let listIdA: string;
  let mealIdA: string;
  let tokenB: string;
  // A known-existing email for anti-enumeration comparison.
  let existingEmail: string;

  beforeAll(async () => {
    await warmUpBackend();

    // Family A — owns private resources (pantry item, shopping list, meal).
    existingEmail = qaEmail('sec-a');
    const regA = await apiSrv
      .post(api('/auth/register'))
      .send({
        email: existingEmail,
        password: STRONG_PASSWORD,
        firstName: 'Sec',
        lastName: 'A',
        familyName: 'Sec Family A',
      })
      .expect(201);
    tokenA = regA.body.tokens.accessToken;

    const item = await apiSrv
      .post(api('/pantry'))
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Secret Thit bo',
        quantity: 1,
        unit: 'kg',
        expiryDate: '2099-01-01T00:00:00.000Z',
      })
      .expect(201);
    itemIdA = item.body.id ?? item.body.item?.id ?? item.body._id;

    const listA = await apiSrv
      .post(api('/shopping-lists'))
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Secret list A' })
      .expect(201);
    listIdA = listA.body.id ?? listA.body._id;

    const mealA = await apiSrv
      .post(api('/meals'))
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        date: '2099-01-01T00:00:00.000Z',
        session: 'dinner',
        customName: 'Secret meal A',
      })
      .expect(201);
    mealIdA = mealA.body.id ?? mealA.body._id;

    // Family B — a different tenant that must never see A's data.
    const regB = await apiSrv
      .post(api('/auth/register'))
      .send({
        email: qaEmail('sec-b'),
        password: STRONG_PASSWORD,
        firstName: 'Sec',
        lastName: 'B',
        familyName: 'Sec Family B',
      })
      .expect(201);
    tokenB = regB.body.tokens.accessToken;
  }, 120000);

  // ---- Authentication ---------------------------------------------------
  describe('SEC-LIVE-AUTH: authentication enforcement', () => {
    it('SEC-LIVE-001: protected route without a token is rejected (401)', async () => {
      await apiSrv.get(api('/pantry')).expect(401);
    });

    it('SEC-LIVE-002: malformed bearer token is rejected (401)', async () => {
      await apiSrv
        .get(api('/pantry'))
        .set('Authorization', 'Bearer not-a-real-jwt')
        .expect(401);
    });

    it('SEC-LIVE-003: token forged with a wrong secret is rejected (401)', async () => {
      const forged = jwt.sign(
        { sub: '0123456789abcdef01234567', role: 'admin' },
        'totally-wrong-secret',
        { expiresIn: '15m' },
      );
      await apiSrv
        .get(api('/pantry'))
        .set('Authorization', `Bearer ${forged}`)
        .expect(401);
    });

    it('SEC-LIVE-004: wrong password (valid length) does not authenticate (401)', async () => {
      await apiSrv
        .post(api('/auth/login'))
        .send({ identifier: 'admin@navimart.local', password: 'WrongPass123!' })
        .expect(401);
    });
  });

  // ---- Input validation -------------------------------------------------
  describe('SEC-LIVE-VAL: input validation hardening', () => {
    it('SEC-LIVE-005: too-short password is rejected by the DTO (400)', async () => {
      await apiSrv
        .post(api('/auth/login'))
        .send({ identifier: 'someone@example.com', password: 'short' })
        .expect(400);
    });

    it('SEC-LIVE-006: unknown/extra fields are stripped & rejected (400)', async () => {
      // forbidNonWhitelisted: true -> mass-assignment attempts are 400.
      await apiSrv
        .post(api('/auth/register'))
        .send({
          email: qaEmail('sec-extra'),
          password: STRONG_PASSWORD,
          firstName: 'X',
          lastName: 'Y',
          role: 'admin', // attempt to self-escalate via a non-whitelisted field
          isAdmin: true,
        })
        .expect(400);
    });

    it('SEC-LIVE-007: invalid email format is rejected (400)', async () => {
      await apiSrv
        .post(api('/auth/register'))
        .send({
          email: 'not-an-email',
          password: STRONG_PASSWORD,
          firstName: 'X',
          lastName: 'Y',
        })
        .expect(400);
    });
  });

  // ---- Injection --------------------------------------------------------
  describe('SEC-LIVE-INJ: injection resistance', () => {
    it('SEC-LIVE-008: NoSQL operator object in identifier is not honored', async () => {
      // A classic Mongo auth-bypass payload: {"$gt":""}. The string-typed DTO
      // must reject it (400) — and it must NEVER return 200 with a session.
      const res = await apiSrv
        .post(api('/auth/login'))
        .send({ identifier: { $gt: '' }, password: { $gt: '' } });
      expect(res.status).not.toBe(200);
      expect([400, 401]).toContain(res.status);
      expect(res.body.tokens).toBeUndefined();
    });
  });

  // ---- Object-level authorization (IDOR) -------------------------------
  describe('SEC-LIVE-OBJ: broken object-level authorization', () => {
    it('SEC-LIVE-009: owner can read its own pantry item (200)', async () => {
      await apiSrv
        .get(api(`/pantry/${itemIdA}`))
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
    });

    it("SEC-LIVE-010: another family cannot read it — no leak (404)", async () => {
      await apiSrv
        .get(api(`/pantry/${itemIdA}`))
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });

  // ---- Role-based access control ---------------------------------------
  describe('SEC-LIVE-RBAC: privilege separation', () => {
    it('SEC-LIVE-011: a non-admin user cannot reach admin stats (401/403)', async () => {
      const res = await apiSrv
        .get(api('/admin/stats'))
        .set('Authorization', `Bearer ${tokenA}`);
      expect([401, 403]).toContain(res.status);
    });

    it('SEC-LIVE-012: a non-admin user cannot list all users (401/403)', async () => {
      const res = await apiSrv
        .get(api('/admin/users'))
        .set('Authorization', `Bearer ${tokenA}`);
      expect([401, 403]).toContain(res.status);
    });
  });

  // ---- Transport & security headers ------------------------------------
  describe('SEC-LIVE-HDR: transport & security headers', () => {
    it('SEC-LIVE-013: frontend is served over HTTPS with HSTS', async () => {
      const res = await web.get('/').expect(200);
      expect(res.headers['strict-transport-security']).toMatch(/max-age=\d+/);
    });
  });

  // ---- More input validation -------------------------------------------
  describe('SEC-LIVE-VAL2: business-rule validation', () => {
    it('SEC-LIVE-014: negative pantry quantity is rejected (400)', async () => {
      const res = await apiSrv
        .post(api('/pantry'))
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Bad qty',
          quantity: -5,
          unit: 'kg',
          expiryDate: '2099-01-01T00:00:00.000Z',
        });
      expect(res.status).toBe(400);
    });
  });

  // ---- Error handling hygiene ------------------------------------------
  describe('SEC-LIVE-ERR: error responses do not leak internals', () => {
    it('SEC-LIVE-015: unknown route returns a generic 404 (no stack trace)', async () => {
      const res = await apiSrv
        .get(api('/this-route-does-not-exist'))
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(404);
      const body = JSON.stringify(res.body);
      expect(body).not.toMatch(/at \/|node_modules|\.ts:\d+|stack/i);
    });
  });

  // ---- IDOR across more resource types ---------------------------------
  describe('SEC-LIVE-OBJ2: cross-tenant isolation on more resources', () => {
    it("SEC-LIVE-016: family B cannot read family A's shopping list (404)", async () => {
      await apiSrv
        .get(api(`/shopping-lists/${listIdA}`))
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      await apiSrv
        .get(api(`/shopping-lists/${listIdA}`))
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });

    it("SEC-LIVE-017: family B cannot read family A's meal plan (404)", async () => {
      await apiSrv
        .get(api(`/meals/${mealIdA}`))
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      await apiSrv
        .get(api(`/meals/${mealIdA}`))
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });

  // ---- Sensitive data exposure -----------------------------------------
  describe('SEC-LIVE-LEAK: no credential material in responses', () => {
    it('SEC-LIVE-018: auth/profile responses never include password material', async () => {
      const me = await apiSrv
        .get(api('/users/me'))
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      const body = JSON.stringify(me.body).toLowerCase();
      expect(body).not.toContain('password');
      expect(body).not.toContain('passwordhash');
      expect(body).not.toContain('"hash"');
    });
  });

  // ---- Account enumeration ---------------------------------------------
  describe('SEC-LIVE-ENUM: no user enumeration', () => {
    it('SEC-LIVE-019: forgot-password is identical for existing vs unknown emails', async () => {
      const existing = await apiSrv
        .post(api('/auth/forgot-password'))
        .send({ identifier: existingEmail })
        .expect(200);
      const unknown = await apiSrv
        .post(api('/auth/forgot-password'))
        .send({ identifier: `nobody.${Date.now()}@navimart.test` })
        .expect(200);
      // Same shape, and — crucially in production — no dev reset token leaked.
      expect(existing.body).toEqual({ success: true });
      expect(unknown.body).toEqual({ success: true });
      expect(existing.body.devResetToken).toBeUndefined();
    });
  });

  // ---- Refresh token abuse ---------------------------------------------
  describe('SEC-LIVE-REF: refresh endpoint hardening', () => {
    it('SEC-LIVE-020: a garbage refresh token is rejected (401)', async () => {
      await apiSrv
        .post(api('/auth/refresh'))
        .send({ refreshToken: 'not.a.valid.refresh.token' })
        .expect(401);
    });
  });
});
