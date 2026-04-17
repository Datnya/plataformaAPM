-- Migration: Add new columns for content calendar redesign
-- These columns support the new calendar layout with tabs (APM / LOGRA),
-- separate platform, content pillar, topic, post type, objective KPI, and month fields.

-- Add new columns (will silently skip if they already exist thanks to IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_contents' AND column_name='month') THEN
    ALTER TABLE social_contents ADD COLUMN month TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_contents' AND column_name='platform') THEN
    ALTER TABLE social_contents ADD COLUMN platform TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_contents' AND column_name='content_pillar') THEN
    ALTER TABLE social_contents ADD COLUMN content_pillar TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_contents' AND column_name='topic') THEN
    ALTER TABLE social_contents ADD COLUMN topic TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_contents' AND column_name='post_type') THEN
    ALTER TABLE social_contents ADD COLUMN post_type TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_contents' AND column_name='objective_kpi') THEN
    ALTER TABLE social_contents ADD COLUMN objective_kpi TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_contents' AND column_name='calendar_brand') THEN
    ALTER TABLE social_contents ADD COLUMN calendar_brand TEXT DEFAULT 'APM';
  END IF;
END
$$;

-- Backfill existing rows: copy legacy data into new columns where empty
UPDATE social_contents
SET
  month = COALESCE(NULLIF(month, ''), TO_CHAR(publish_date, 'TMMonth')),
  platform = COALESCE(NULLIF(platform, ''),
    CASE
      WHEN networks IS NOT NULL AND jsonb_array_length(networks::jsonb) > 0
        THEN networks::jsonb->>0
      ELSE ''
    END
  ),
  content_pillar = COALESCE(NULLIF(content_pillar, ''), content_type, ''),
  topic = COALESCE(NULLIF(topic, ''), title, ''),
  post_type = COALESCE(NULLIF(post_type, ''), format, ''),
  calendar_brand = COALESCE(NULLIF(calendar_brand, ''), 'APM')
WHERE month = '' OR month IS NULL;
