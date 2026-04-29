-- TTS usage tracking: per-user daily character limit
CREATE TABLE tts_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  char_count integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, usage_date)
);

CREATE INDEX idx_tts_usage_user_date ON tts_usage (user_id, usage_date);

ALTER TABLE tts_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tts_usage"
  ON tts_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tts_usage"
  ON tts_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tts_usage"
  ON tts_usage FOR UPDATE
  USING (auth.uid() = user_id);
