-- Add verification columns to sites table
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS verification_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Make verification_token unique just in case, though UUID collision is rare
CREATE INDEX IF NOT EXISTS idx_sites_verification_token ON sites(verification_token);
