CREATE TABLE IF NOT EXISTS radiographer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    followed_breathhold BOOLEAN NOT NULL,
    repeat_scan_required BOOLEAN NOT NULL,
    language_used VARCHAR(2) NOT NULL,
    comments TEXT CHECK (length(comments) <= 1000),
    radiographer_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_radio_notes_session_id ON radiographer_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_radio_notes_created_at ON radiographer_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_radio_notes_repeat_scan ON radiographer_notes(repeat_scan_required);
