CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language VARCHAR(2) NOT NULL CHECK (language IN ('en', 'sn', 'nd')),
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_modules TEXT[] DEFAULT '{}',
    device_type VARCHAR(20) CHECK (device_type IN ('tablet', 'phone', 'unknown')),
    last_active_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_language ON sessions(language);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
