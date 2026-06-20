import request from 'supertest';
import {
  API_ORIGIN,
  WEB_ORIGIN,
  api,
  qaEmail,
  STRONG_PASSWORD,
  warmUpBackend,
} from './live-config';

/**
 * INTEGRATION (black-box, live deployment).
 *
 * These exercise the REAL deployed system end-to-end over HTTPS: the Vite SPA
 * served by Vercel and the NestJS API served by Render, talking to the real
 * production MongoDB. They verify cross-module flows (auth -> users -> family ->
 * pantry -> recipes) that only manifest once routing, CORS, JWT and the DB are
 * wired together in production.
 *
 * Run with: npm run test:live
 */
describe('NaviMart — Integration (live deployment)', () => {
  const web = request(WEB_ORIGIN);
  const apiSrv = request(API_ORIGIN);

  // Shared state built up across the journey.
  let email: string;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;
  let createdPantryItemId: string | undefined;

  beforeAll(async () => {
    await warmUpBackend();
    email = qaEmail('int');
  }, 120000);

  // ---- Frontend (Vercel) ------------------------------------------------
  describe('INT-WEB: frontend delivery', () => {
    it('INT-WEB-001: serves the SPA shell at / (200, NaviMart title)', async () => {
      const res = await web.get('/').expect(200);
      expect(res.text).toContain('<title>NaviMart</title>');
      expect(res.text).toContain('<div id="root">');
    });

    it('INT-WEB-002: SPA deep links fall back to index.html (client routing)', async () => {
      // The vercel.json rewrite sends every path to index.html so React Router
      // can resolve it client-side. A deep link must NOT 404.
      const res = await web.get('/home').expect(200);
      expect(res.text).toContain('<div id="root">');
    });

    it('INT-WEB-003: static asset bundle is reachable and cached', async () => {
      const shell = await web.get('/').expect(200);
      const match = shell.text.match(/src="(\/assets\/index-[^"]+\.js)"/);
      expect(match).toBeTruthy();
      const res = await web.get(match![1]).expect(200);
      expect(res.headers['content-type']).toMatch(/javascript/);
    });
  });

  // ---- Backend health ---------------------------------------------------
  describe('INT-API: backend availability', () => {
    it('INT-API-001: GET /api/health returns ok', async () => {
      const res = await apiSrv.get(api('/health')).expect(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('navimart-backend');
    });
  });

  // ---- Auth -> Users journey -------------------------------------------
  describe('INT-AUTH: registration, login, profile, refresh', () => {
    it('INT-AUTH-001: registers a new account and auto-creates a family (201)', async () => {
      const res = await apiSrv
        .post(api('/auth/register'))
        .send({
          email,
          password: STRONG_PASSWORD,
          firstName: 'QA',
          lastName: 'Integration',
          familyName: 'QA Integration Family',
        })
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(email.toLowerCase());
      expect(res.body.user.activeFamilyId).toBeTruthy();
      expect(res.body.tokens.accessToken).toEqual(expect.any(String));
      expect(res.body.tokens.refreshToken).toEqual(expect.any(String));

      userId = res.body.user.id;
      accessToken = res.body.tokens.accessToken;
      refreshToken = res.body.tokens.refreshToken;
    });

    it('INT-AUTH-002: logs in with the same credentials (200)', async () => {
      const res = await apiSrv
        .post(api('/auth/login'))
        .send({ identifier: email, password: STRONG_PASSWORD })
        .expect(200);
      expect(res.body.tokens.accessToken).toEqual(expect.any(String));
      expect(res.body.user.id).toBe(userId);
      // Rotate to the freshest token for the rest of the journey.
      accessToken = res.body.tokens.accessToken;
      refreshToken = res.body.tokens.refreshToken;
    });

    it('INT-AUTH-003: GET /api/users/me returns the authenticated profile (200)', async () => {
      const res = await apiSrv
        .get(api('/users/me'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.id).toBe(userId);
      expect(res.body.email).toBe(email.toLowerCase());
    });

    it('INT-AUTH-004: refresh token rotation issues new tokens (200)', async () => {
      const res = await apiSrv
        .post(api('/auth/refresh'))
        .send({ refreshToken })
        .expect(200);
      expect(res.body.tokens.accessToken).toEqual(expect.any(String));
      expect(res.body.tokens.refreshToken).toEqual(expect.any(String));
      accessToken = res.body.tokens.accessToken;
    });
  });

  // ---- Catalog (auth-gated read) ---------------------------------------
  describe('INT-CAT: catalog reads with a valid token', () => {
    it('INT-CAT-001: GET /api/catalog/foods returns a list (200)', async () => {
      const res = await apiSrv
        .get(api('/catalog/foods?q=ca'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(Array.isArray(res.body) || Array.isArray(res.body.items)).toBe(
        true,
      );
    });

    it('INT-CAT-002: categories and units are reachable (200)', async () => {
      await apiSrv
        .get(api('/catalog/categories'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      await apiSrv
        .get(api('/catalog/units'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  // ---- Pantry round-trip (write + read + cleanup) ----------------------
  describe('INT-PAN: pantry CRUD round-trip', () => {
    it('INT-PAN-001: creates a pantry item (201)', async () => {
      const res = await apiSrv
        .post(api('/pantry'))
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'QA Thit bo',
          quantity: 2,
          unit: 'kg',
          expiryDate: '2099-01-01T00:00:00.000Z',
        })
        .expect(201);
      createdPantryItemId = res.body.id ?? res.body.item?.id ?? res.body._id;
      expect(createdPantryItemId).toBeTruthy();
    });

    it('INT-PAN-002: the new item appears in the list (200)', async () => {
      const res = await apiSrv
        .get(api('/pantry'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const items: any[] = Array.isArray(res.body)
        ? res.body
        : (res.body.items ?? []);
      expect(items.some((i) => (i.id ?? i._id) === createdPantryItemId)).toBe(
        true,
      );
    });

    it('INT-PAN-003: GET by id returns the owned item (200)', async () => {
      await apiSrv
        .get(api(`/pantry/${createdPantryItemId}`))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('INT-PAN-004: deletes the item to keep prod tidy (200/204)', async () => {
      const res = await apiSrv
        .delete(api(`/pantry/${createdPantryItemId}`))
        .set('Authorization', `Bearer ${accessToken}`);
      expect([200, 204]).toContain(res.status);
    });
  });

  // ---- Recipes (cross-module read) -------------------------------------
  describe('INT-RCP: recipe reads', () => {
    it('INT-RCP-001: GET /api/recipes returns results (200)', async () => {
      const res = await apiSrv
        .get(api('/recipes'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(
        Array.isArray(res.body) ||
          Array.isArray(res.body.items) ||
          Array.isArray(res.body.recipes),
      ).toBe(true);
    });

    it('INT-RCP-002: GET /api/recipes/suggestions ranks against the pantry (200)', async () => {
      await apiSrv
        .get(api('/recipes/suggestions'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  // ---- Family ----------------------------------------------------------
  describe('INT-FAM: family resource', () => {
    it('INT-FAM-001: GET /api/family returns the auto-created family with members (200)', async () => {
      const res = await apiSrv
        .get(api('/family'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.id).toBeTruthy();
      expect(Array.isArray(res.body.members)).toBe(true);
      expect(res.body.members.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---- Shopping list round-trip ----------------------------------------
  describe('INT-SL: shopping list CRUD round-trip', () => {
    let listId: string;

    it('INT-SL-001: creates a shopping list (201)', async () => {
      const res = await apiSrv
        .post(api('/shopping-lists'))
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'QA cuoi tuan' })
        .expect(201);
      listId = res.body.id ?? res.body._id;
      expect(listId).toBeTruthy();
      expect(res.body.status).toBe('active');
    });

    it('INT-SL-002: the list is listed and readable by id (200)', async () => {
      const list = await apiSrv
        .get(api('/shopping-lists'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const items: any[] = Array.isArray(list.body)
        ? list.body
        : (list.body.items ?? []);
      expect(items.some((l) => (l.id ?? l._id) === listId)).toBe(true);
      await apiSrv
        .get(api(`/shopping-lists/${listId}`))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('INT-SL-003: deletes the list to keep prod tidy (200/204)', async () => {
      const res = await apiSrv
        .delete(api(`/shopping-lists/${listId}`))
        .set('Authorization', `Bearer ${accessToken}`);
      expect([200, 204]).toContain(res.status);
    });
  });

  // ---- Meal round-trip -------------------------------------------------
  describe('INT-MEAL: meal plan round-trip', () => {
    let mealId: string;

    it('INT-MEAL-001: creates a meal plan (201)', async () => {
      const res = await apiSrv
        .post(api('/meals'))
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          date: '2099-01-01T00:00:00.000Z',
          session: 'dinner',
          customName: 'QA Com toi',
        })
        .expect(201);
      mealId = res.body.id ?? res.body._id;
      expect(mealId).toBeTruthy();
    });

    it('INT-MEAL-002: reads it by id then deletes it (200 -> 200/204)', async () => {
      await apiSrv
        .get(api(`/meals/${mealId}`))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const res = await apiSrv
        .delete(api(`/meals/${mealId}`))
        .set('Authorization', `Bearer ${accessToken}`);
      expect([200, 204]).toContain(res.status);
    });
  });

  // ---- Notifications / Reports / AI status -----------------------------
  describe('INT-MISC: notifications, reports, AI status', () => {
    it('INT-NTF-001: GET /api/notifications returns an array (200)', async () => {
      const res = await apiSrv
        .get(api('/notifications'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(
        Array.isArray(res.body) || Array.isArray(res.body.items),
      ).toBe(true);
    });

    it('INT-RPT-001: GET /api/reports/dashboard with a date range aggregates (200)', async () => {
      const res = await apiSrv
        .get(
          api(
            '/reports/dashboard?startDate=2026-01-01T00:00:00.000Z&endDate=2026-12-31T00:00:00.000Z',
          ),
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.range).toBeDefined();
      expect(res.body.shopping).toBeDefined();
    });

    it('INT-AI-001: GET /api/ai-chef/status reports configuration (200)', async () => {
      const res = await apiSrv
        .get(api('/ai-chef/status'))
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(typeof res.body.configured).toBe('boolean');
    });
  });

  // ---- CORS (browser interop with the Vercel origin) -------------------
  describe('INT-CORS: cross-origin access for the SPA', () => {
    it('INT-CORS-001: preflight from the Vercel origin is allowed', async () => {
      const res = await apiSrv
        .options(api('/pantry'))
        .set('Origin', WEB_ORIGIN)
        .set('Access-Control-Request-Method', 'GET');
      expect([200, 204]).toContain(res.status);
      expect(res.headers['access-control-allow-origin']).toBe(WEB_ORIGIN);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  // ---- Logout revokes the refresh token --------------------------------
  describe('INT-LOGOUT: session teardown', () => {
    it('INT-LOGOUT-001: after logout the old refresh token is rejected (401)', async () => {
      // Use a dedicated throwaway account so this does not disturb the journey.
      const reg = await apiSrv
        .post(api('/auth/register'))
        .send({
          email: qaEmail('int-logout'),
          password: STRONG_PASSWORD,
          firstName: 'QA',
          lastName: 'Logout',
          familyName: 'QA Logout Family',
        })
        .expect(201);
      const token = reg.body.tokens.accessToken;
      const oldRefresh = reg.body.tokens.refreshToken;

      await apiSrv
        .post(api('/auth/logout'))
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // The refresh token issued before logout must no longer be accepted.
      await apiSrv
        .post(api('/auth/refresh'))
        .send({ refreshToken: oldRefresh })
        .expect(401);
    });
  });
});
