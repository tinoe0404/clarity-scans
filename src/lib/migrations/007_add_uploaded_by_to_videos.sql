-- Create upload_by column
ALTER TABLE videos 
ADD COLUMN uploaded_by VARCHAR(255);

-- Index for querying videos by specific user
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON videos(uploaded_by);
