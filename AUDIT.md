# Audit DoFri — 2026-04-29

## Résumé exécutif

**48 findings** : 3 CRITICAL, 8 HIGH, 15 MEDIUM, 20 LOW/INFO

### Top 3 priorités
1. Éliminer XSS via `innerHTML` dans FreetchPage (40+ insertions DOM avec données externes/utilisateur).
2. Sécuriser le token JWT (localStorage 8h, pas de refresh token).
3. Corriger memory leaks et race conditions (useEffect, listeners non nettoyés).

---

## 1. Sécurité

### [CRITICAL] FreetchPage.tsx — XSS via `.innerHTML` non échappé
- 20+ template-strings injectés dans `innerHTML` avec données utilisateur (`searchKeyword`, `channelName`) ou Twitch (`title`, `game_name`, `user_name`).
- **Impact** : self-XSS minimum (token Twitch côté navigateur victime), aggravé si l'attaquant contrôle un titre de stream.
- **Fix** : remplacer chaque `innerHTML = template` par `createElement` + `textContent`, ou DOMPurify.

### [HIGH] AuthContext / linksApi.ts — JWT en localStorage, pas de refresh
- Token JWT 8h stocké en `localStorage` → vulnérable à toute XSS.
- Auto-logout uniquement sur 401 ; un token compromis reste valide jusqu'à expiration.
- **Fix** : refresh token + cookie httpOnly côté serveur, route `/api/auth/logout` qui invalide.

### [HIGH] server/src/routes/screenshots.ts — SSRF incomplet sur les redirects
- Blocklist IPs privées/IPv6 partielle, pas de revalidation après 3xx.
- **Fix** : `axios maxRedirects: 0`, revalider l'URL finale.

### [HIGH] server/src/routes/discussions.ts — `isAdminRequest()` duplique le middleware
- Deux chemins de validation JWT (middleware + route).
- **Fix** : utiliser `requireAuth` partout.

### [MEDIUM] server/src/routes/health.ts — `POST /health/check` public et non rate-limité dédié
- N'importe qui peut déclencher la vérification HTTP de tous les liens.
- **Fix** : `requireAuth` ou rate-limit strict (1 req / 5 min / IP).

### [MEDIUM] server/src/routes/links.ts — Bulk import sans schema validation
- Pas de validation per-link (regex bombs possibles dans description).
- **Fix** : zod/joi schema, limiter chaque champ.

### [LOW] server/src/middleware/errorHandler.ts — Stack trace exposée en dev
- OK en dev, à vérifier que `NODE_ENV !== 'production'` strictement.

### [INFO] client/src/utils/visitorId.ts — Tracking sans consent RGPD
- UUID persistant en `localStorage` sans cookie banner.
- **Fix** : banner consentement avant `localStorage.setItem`.

---

## 2. Bugs / Correctness

### [CRITICAL] FreetchPage.tsx — Memory/listener leaks au démontage
- Plusieurs `document.addEventListener` (autocomplete, quality menu) ; cleanup retire seulement un.
- **Impact** : empilement à chaque retour sur `/freetch`.
- **Fix** : stocker chaque handler en variable, retirer dans `cleanup()`.

### [HIGH] LinksContext.tsx:97 — useEffect deps incohérentes
- `setInterval(refreshHealth, 60000)` avec deps `[refreshHealth, refreshRatings]` se recrée à chaque changement.
- **Fix** : initialisation seule (`[]`), ou `useRef` sur la fonction.

### [HIGH] server/src/services/healthChecker.ts:75 — Pool de concurrence à vérifier
- L'agent rapporte `Promise.resolve(e) === e` qui ne peut jamais être true → splice toujours position 0.
- **À VÉRIFIER manuellement** avant fix.

### [MEDIUM] HomePage.tsx:52-65 — `handleCreate` / `handleUpdate` sans try/catch
- Erreur réseau silencieuse, pas de toast d'erreur.

### [MEDIUM] AdminPage.tsx — Drag-drop refs non reset après early-return
- À VÉRIFIER : potentiel bug sur drag-drops successifs.

### [MEDIUM] server/src/routes/links.ts — `PUT /links/reorder` non idempotent
- Pas de transaction, race condition si 2 reorders simultanés.

### [LOW] LinkCard.tsx — `rateLink().catch(() => {})` avale l'erreur
- Aucun feedback utilisateur.

---

## 3. Qualité de code

### [MEDIUM] FreetchPage.tsx — ~2000 lignes monolithiques
- Tout le DOM imperative + state + JSX dans un seul composant.
- **Fix** : scinder (`FreetchPlayer`, `FreetchSidebar`, `FreetchDiscovery`, `useTwitchAuth`).

### [MEDIUM] AdminPage.tsx (>550 lignes) — super composant
- **Fix** : extraire panels.

### [MEDIUM] linksApi.ts — pas de wrapper d'erreur unifié
- 20+ fonctions avec try/catch chez l'appelant.

### [LOW] Imports inutilisés / `noUnusedLocals: false`
- **Fix** : activer dans `tsconfig.json`.

### [LOW] server/src/types vs shared/types.ts — duplication possible
- À VÉRIFIER.

---

## 4. Performance

### [MEDIUM] SearchBar — pas de debounce
- Refetch à chaque keystroke.
- **Fix** : debounce 300ms.

### [MEDIUM] linkService.ts — regex sur tags
- Full table scan possible si beaucoup de liens.

### [MEDIUM] LinksContext — polling 60s pour `refreshHealth`
- Scaling limité.

### [MEDIUM] Bulk import séquentiel
- `for...await` au lieu d'`insertMany`.

---

## 5. Accessibilité

### [HIGH] FreetchPage — boutons sans `aria-label`
- Login, refresh, logout, watch-live, etc.

### [MEDIUM] LinkCard — `alt=""` sur thumbnails
- **Fix** : `alt={link.title}`.

### [MEDIUM] HomePage — contraste blanc/70% sur gradient
- À tester avec Lighthouse.

### [LOW] DiscussionsPage — focus management modals
- Pas d'autoFocus, pas de focus trap.

### [LOW] Icon-only buttons sans `title` ni `aria-label`

---

## 6. Architecture

### [MEDIUM] Pas de repository pattern
- Routes parlent directement aux modèles Mongoose.

### [LOW] Pas d'ErrorBoundary React
- Crash propagé à toute l'app.

---

## 7. Build / Deploy / Config

### [HIGH] tsconfig — `strict: true` mais `noUnusedLocals: false`

### [MEDIUM] Pas de `engines.node` dans `package.json`

### [MEDIUM] `mongoose.connect` sans `maxPoolSize` / `minPoolSize`

### [LOW] Pas de `.nvmrc` ni `DEPLOY.md`

---

## 8. Responsive / UX

### [MEDIUM] AdminPage table — overflow horizontal <600px

### [LOW] Tap targets <44px (StarRating, flag icon)

---

## Plan de correction

### Sprint 1 — Blockers sécurité
1. Éliminer `innerHTML` FreetchPage (createElement + textContent)
2. Cleanup complet des listeners au démontage
3. Protéger `/api/health/check` (auth + rate-limit)
4. Vérifier SSRF screenshots (revalider après redirects)

### Sprint 2 — Hardening auth + correctness
5. Refresh token + httpOnly cookie
6. Fixer deps `LinksContext`
7. Auditer `healthChecker.ts:75` puis fixer si confirmé
8. try/catch + toasts dans `handleCreate`/`handleUpdate`

### Sprint 3 — Performance + UX
9. Debounce SearchBar 300ms
10. `insertMany` pour bulk import
11. Scinder FreetchPage en sous-composants
12. Accessibilité (aria-label, alt, focus)

### Sprint 4 — Cleanup
13. `noUnusedLocals: true` + ménage imports
14. `engines.node` + `.nvmrc`
15. ErrorBoundary
16. Cookie consent RGPD
17. `DEPLOY.md`

---

## Points positifs

- Pas de secret versionné, `.gitignore` correct
- Rate-limiting général en place
- Validation `isAllowedUrl()` côté serveur
- Auth password timing-safe
- TS strict côté client
- Séparation routes/services/models (sauf FreetchPage)
