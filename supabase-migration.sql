-- CalcosNQN Database Schema Migration
-- Apply via Supabase MCP apply_migration tool

-- Enums
CREATE TYPE base_type AS ENUM ('base_blanca', 'base_holografica');
CREATE TYPE sticker_status AS ENUM ('active', 'draft', 'archived');

-- Stickers table
CREATE TABLE stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_number TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  base_type base_type NOT NULL DEFAULT 'base_blanca',
  price_ars NUMERIC NOT NULL CHECK (price_ars > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  image_path TEXT,
  status sticker_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Junction table
CREATE TABLE sticker_tags (
  sticker_id UUID NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (sticker_id, tag_id)
);

-- Indexes
CREATE INDEX idx_stickers_status ON stickers(status);
CREATE INDEX idx_stickers_slug ON stickers(slug);
CREATE INDEX idx_stickers_base_type ON stickers(base_type);
CREATE INDEX idx_stickers_is_featured ON stickers(is_featured);
CREATE INDEX idx_stickers_sort_order ON stickers(sort_order);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_sticker_tags_tag ON sticker_tags(tag_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stickers_updated_at
  BEFORE UPDATE ON stickers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_tags ENABLE ROW LEVEL SECURITY;

-- Public read for active stickers
CREATE POLICY "Public can read active stickers"
  ON stickers FOR SELECT
  USING (status = 'active');

-- Admin can do everything with stickers
CREATE POLICY "Admin full access to stickers"
  ON stickers FOR ALL
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Public read for all tags
CREATE POLICY "Public can read tags"
  ON tags FOR SELECT
  USING (true);

-- Admin can do everything with tags
CREATE POLICY "Admin full access to tags"
  ON tags FOR ALL
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Public read sticker_tags (needed for joins)
CREATE POLICY "Public can read sticker_tags"
  ON sticker_tags FOR SELECT
  USING (true);

-- Admin can manage sticker_tags
CREATE POLICY "Admin full access to sticker_tags"
  ON sticker_tags FOR ALL
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Seed tags
INSERT INTO tags (name_es, name_en, slug) VALUES
  ('Villa La Angostura', 'Villa La Angostura', 'villa-la-angostura'),
  ('Las Grutas', 'Las Grutas', 'las-grutas'),
  ('Cerro Bayo', 'Cerro Bayo', 'cerro-bayo'),
  ('Bariloche', 'Bariloche', 'bariloche'),
  ('Patagonia', 'Patagonia', 'patagonia'),
  ('Anime', 'Anime', 'anime'),
  ('Dibujos Animados', 'Cartoons', 'dibujos-animados'),
  ('Deportes', 'Sports', 'deportes'),
  ('Cultura Argentina', 'Argentine Culture', 'cultura-argentina'),
  ('Holográfico', 'Holographic', 'holografico'),
  ('Temporada 2025', 'Season 2025', 'temporada-2025'),
  ('Temporada 2026', 'Season 2026', 'temporada-2026'),
  ('Montaña', 'Mountain', 'montana'),
  ('Playa', 'Beach', 'playa'),
  ('Naturaleza', 'Nature', 'naturaleza'),
  ('Humor', 'Humor', 'humor');
