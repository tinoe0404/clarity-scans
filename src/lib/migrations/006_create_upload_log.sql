-- Create upload_log table
CREATE TABLE IF NOT EXISTS upload_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  slug VARCHAR(255),
  locale VARCHAR(10),
  blob_url TEXT,
  file_size_bytes INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying logs by specific module
CREATE INDEX IF NOT EXISTS idx_upload_log_slug ON upload_log(slug);
-- Index for chronological sorting of audit trails
CREATE INDEX IF NOT EXISTS idx_upload_log_created_at ON upload_log(created_at DESC);
