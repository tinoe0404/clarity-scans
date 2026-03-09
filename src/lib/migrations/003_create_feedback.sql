CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    understood_procedure BOOLEAN,
    anxiety_before SMALLINT CHECK (anxiety_before BETWEEN 1 AND 5),
    anxiety_after SMALLINT CHECK (anxiety_after BETWEEN 1 AND 5),
    app_helpful BOOLEAN,
    comments TEXT CHECK (length(comments) <= 500),
    submitted_by VARCHAR(20) CHECK (submitted_by IN ('patient', 'radiographer')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_by ON feedback(submitted_by);
