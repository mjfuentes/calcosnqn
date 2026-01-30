# CalcosNQN — Pending Actions & Checklist

## 1. Supabase Database Setup (BLOCKED — MCP token expired)

Once the Supabase MCP is re-authorized, apply these in order:

### 1.1 Apply Schema Migration
- [ ] Apply `supabase-migration.sql` via `apply_migration` MCP tool
  - Creates enums: `base_type`, `sticker_status`
  - Creates tables: `stickers`, `tags`, `sticker_tags`
  - Creates indexes on: status, slug, base_type, is_featured, sort_order, tag_id
  - Creates `update_updated_at_column()` trigger on `stickers`
  - Enables RLS on all three tables
  - Creates RLS policies:
    - Public read active stickers
    - Public read all tags and sticker_tags
    - Admin full access (checked via `auth.users.raw_user_meta_data->>'role' = 'admin'`)

### 1.2 Create Storage Bucket
- [ ] Create `sticker-images` bucket (public read)
- [ ] Set storage policies:
  - Public read on `sticker-images`
  - Admin-only write/delete on `sticker-images`
  - File size limit: 5MB
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

### 1.3 Seed Tags
- [ ] Insert 16 default tags (included in migration SQL):
  Villa La Angostura, Las Grutas, Cerro Bayo, Bariloche, Patagonia,
  Anime, Dibujos Animados, Deportes, Cultura Argentina, Holográfico,
  Temporada 2025, Temporada 2026, Montaña, Playa, Naturaleza, Humor

### 1.4 Create Admin User
- [ ] Create Supabase auth user with email/password
- [ ] Set `raw_user_meta_data` to `{"role": "admin"}`
- [ ] Update `.env.local` with real `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Update `.env.local` with real `SUPABASE_SERVICE_ROLE_KEY`

### 1.5 Verify Database
- [ ] Query `tags` table — should return 16 rows
- [ ] Attempt anonymous insert on `stickers` — should be blocked by RLS
- [ ] Attempt anonymous select on `tags` — should succeed
- [ ] Run `get_advisors` for security check (missing RLS, etc.)

---

## 2. Environment Variables

- [ ] Set real `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Set real `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [ ] Set real `NEXT_PUBLIC_WHATSAPP_PHONE` in `.env.local`
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production URL when deploying
- [ ] Verify `.env.local` is in `.gitignore` (confirmed ✓)
- [ ] Create `.env.local` on production/deploy environment

---

## 3. Testing (Phase 11)

### 3.1 Setup
- [ ] Install Vitest + testing utilities (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`)
- [ ] Install Playwright (`@playwright/test`)
- [ ] Create `vitest.config.ts`
- [ ] Create `playwright.config.ts`
- [ ] Add test scripts to `package.json`: `test`, `test:coverage`, `test:e2e`

### 3.2 Unit Tests
- [ ] Cart store — add item, remove item, update quantity, clear cart, immutability
- [ ] Cart store — totalItems(), totalPrice() calculations
- [ ] Cart store — max stock constraint enforcement
- [ ] WhatsApp message builder — Spanish formatting
- [ ] WhatsApp message builder — English formatting
- [ ] WhatsApp message builder — with/without customer info
- [ ] WhatsApp URL builder — proper encoding
- [ ] Zod schemas — createStickerSchema validation (valid + invalid)
- [ ] Zod schemas — createTagSchema validation
- [ ] Zod schemas — catalogFilterSchema parsing
- [ ] Zod schemas — imageUploadSchema file constraints
- [ ] Utils — formatPrice (ARS currency formatting)
- [ ] Utils — getLocalizedName (es/en)
- [ ] Utils — slugify
- [ ] Utils — cn (class name merge)
- [ ] i18n config — locales, defaultLocale

### 3.3 Integration Tests
- [ ] `getStickers()` — returns stickers with tags
- [ ] `getStickers()` — filters by search, base_type, sort
- [ ] `getStickerBySlug()` — returns single sticker or null
- [ ] `getFeaturedStickers()` — returns featured only
- [ ] `getAllTags()` — returns sorted tags
- [ ] `getRelatedStickers()` — returns related by tags
- [ ] `createSticker` action — requires admin auth
- [ ] `updateSticker` action — updates and revalidates
- [ ] `deleteSticker` action — cascades, cleans storage
- [ ] `createTag`/`updateTag`/`deleteTag` actions
- [ ] `updateStock` action — batch update
- [ ] API `GET /api/stickers` — returns paginated results
- [ ] API `POST /api/stickers` — requires auth, validates input
- [ ] API `PATCH /api/stickers/[id]` — updates sticker
- [ ] API `DELETE /api/stickers/[id]` — deletes sticker + image
- [ ] API `GET /api/tags` — returns all tags
- [ ] API `POST /api/tags` — requires auth
- [ ] API `POST /api/upload` — validates file, uploads to storage

### 3.4 E2E Tests (Playwright)
- [ ] Catalog browsing — load page, see stickers, filter by tag, search
- [ ] Sticker detail — click sticker, see detail info, add to cart
- [ ] Cart flow — add items, adjust quantity, see total, open WhatsApp
- [ ] Language toggle — switch ES/EN, verify translations change
- [ ] Reseller page — fill contact form, validate, send WhatsApp
- [ ] Admin login — enter credentials, redirect to dashboard
- [ ] Admin CRUD — create sticker, verify in catalog, edit, delete
- [ ] Admin tags — create tag, edit, delete
- [ ] Admin stock — update stock quantities

### 3.5 Coverage
- [ ] Run `vitest --coverage` and verify 80%+ threshold
- [ ] Identify uncovered branches and add tests

---

## 4. End-to-End Verification (Manual)

### 4.1 Dev Server
- [ ] `npm run dev` starts without errors
- [ ] Visit `http://localhost:3000` — shows Spanish home page
- [ ] Visit `http://localhost:3000/en` — shows English home page

### 4.2 i18n
- [ ] Default locale (ES) at `/` — all text in Spanish
- [ ] English at `/en` — all text in English
- [ ] Language toggle switches between locales
- [ ] URL updates correctly (`/catalogo` ↔ `/en/catalogo`)
- [ ] Browser back/forward works with locale changes

### 4.3 Catalog
- [ ] `/catalogo` — shows sticker grid from DB
- [ ] Search input — debounces, filters stickers
- [ ] Tag filter bar — horizontal scroll, toggles filter
- [ ] Base type toggle — filters white/holographic
- [ ] Sort select — newest, price asc/desc, A-Z
- [ ] URL searchParams — filters are shareable via URL
- [ ] Pagination — "Ver mas" button loads next page
- [ ] Empty state — "No results" message when filters match nothing
- [ ] Clear filters button resets all

### 4.4 Sticker Detail
- [ ] `/catalogo/[slug]` — shows large image, info, tags
- [ ] Model number, base type badge, price displayed
- [ ] Out-of-stock badge when stock = 0
- [ ] Add to cart button works (toast confirmation)
- [ ] Related stickers section loads based on shared tags
- [ ] SEO metadata (title, description) renders correctly

### 4.5 Cart
- [ ] `/carrito` — shows cart items
- [ ] Empty cart shows message + "Continue shopping" link
- [ ] Quantity +/- buttons work, respect max stock
- [ ] Remove button removes item
- [ ] Total updates correctly
- [ ] Cart persists across page refresh (localStorage)
- [ ] WhatsApp checkout — opens pre-checkout form
- [ ] Pre-checkout form — optional name/city fields
- [ ] WhatsApp message — correct format with model numbers, prices, total
- [ ] Cart clears after checkout with toast

### 4.6 Reseller Page
- [ ] `/vende-en-tu-local` — shows hero, two proposal cards
- [ ] Portabanner card — highlighted with accent border
- [ ] Afiche card — standard styling
- [ ] All proposal items listed with checkmarks
- [ ] Contact form — validates required fields
- [ ] Form submit — opens WhatsApp with pre-filled message
- [ ] Bilingual content — switch to EN, all text translates

### 4.7 Admin Panel
- [ ] `/admin/login` — login form renders
- [ ] Invalid credentials — shows error message
- [ ] Valid admin login — redirects to dashboard
- [ ] Unauthenticated access to `/admin` — shows login or redirects
- [ ] Dashboard — shows stats (total, active, draft, low stock)
- [ ] Sticker list — table with model, name, status, price, stock
- [ ] New sticker — form with all fields, image uploader
- [ ] Image uploader — drag-and-drop, preview, upload to Supabase Storage
- [ ] Sticker edit — pre-fills form, saves updates
- [ ] Sticker delete — confirmation dialog, cascades
- [ ] Created sticker visible in public catalog (when status = active)
- [ ] Tag manager — create, inline edit, delete tags
- [ ] Stock manager — batch edit quantities, save button appears on change
- [ ] Sidebar navigation — highlights active page
- [ ] Logout — clears session, redirects to home

### 4.8 Mobile Responsive
- [ ] Home page — stacks vertically on mobile
- [ ] Header — hamburger menu on mobile
- [ ] Mobile menu — opens/closes, links work, body scroll locks
- [ ] Catalog grid — 2 columns on mobile, 4 on desktop
- [ ] Cart — full width on mobile
- [ ] Admin — sidebar hidden on mobile (uses top nav or full-width layout)
- [ ] Reseller — cards stack on mobile

### 4.9 Accessibility
- [ ] All interactive elements have focus rings (accent color)
- [ ] Images have alt text
- [ ] Buttons/links have aria-labels where icon-only
- [ ] Dialog traps focus, closes on Escape
- [ ] Color contrast meets WCAG AA (accent gold on dark bg)
- [ ] Keyboard navigation works through catalog, cart, forms

---

## 5. Pre-Deploy Checklist

- [ ] Remove `supabase-migration.sql` from repo (or move to `/supabase/migrations/`)
- [ ] Replace placeholder env values with real keys
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Set `NEXT_PUBLIC_WHATSAPP_PHONE` to real phone number
- [ ] Add OG image to `public/images/og.png`
- [ ] Add CalcosNQN logo to `public/images/logo.png`
- [ ] Configure Vercel (or host) environment variables
- [ ] Run `npm run build` on production — 0 errors
- [ ] Run full test suite — all pass, 80%+ coverage
- [ ] Check Supabase security advisors — no critical warnings
- [ ] Verify RLS policies block anonymous writes
- [ ] Test WhatsApp checkout on real phone

---

## 6. Known Limitations / Future Improvements

- [ ] Next.js 16 deprecates `middleware.ts` — migrate to `proxy` when stable
- [ ] Tag-based filtering in catalog currently uses URL params only (no server-side tag join filter yet — works via client-side display of all stickers)
- [ ] No image optimization pipeline (relies on next/image + Supabase CDN)
- [ ] No email notifications for orders (WhatsApp only)
- [ ] No analytics integration
- [ ] No sitemap.xml / robots.txt generation
- [ ] Admin panel has no mobile sidebar (hidden on small screens)
- [ ] No password reset flow for admin
- [ ] No rate limiting on API routes (rely on Supabase RLS + edge)
