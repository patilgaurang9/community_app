CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'connected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure self-connections are prevented
  CONSTRAINT no_self_connections CHECK (requester_id != receiver_id)
);

-- =====================================================
-- THE FIX: UNIQUE INDEX FOR BIDIRECTIONAL UNIQUENESS
-- =====================================================
-- This effectively does what your broken constraint tried to do.
-- It ensures that the pair (userA, userB) is unique regardless of order.
CREATE UNIQUE INDEX IF NOT EXISTS unique_connection_pair 
ON connections (
  LEAST(requester_id, receiver_id), 
  GREATEST(requester_id, receiver_id)
);

-- =====================================================
-- STANDARD INDEXES
-- =====================================================

-- Index for fast lookups by requester
CREATE INDEX IF NOT EXISTS idx_connections_requester 
  ON connections(requester_id);

-- Index for fast lookups by receiver
CREATE INDEX IF NOT EXISTS idx_connections_receiver 
  ON connections(receiver_id);

-- Index for finding connections by status
CREATE INDEX IF NOT EXISTS idx_connections_status 
  ON connections(status);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_connections_user_status 
  ON connections(requester_id, receiver_id, status);

-- =====================================================
-- RLS POLICIES (Row Level Security)
-- =====================================================
-- Enable RLS on the table
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Allow users to view connections where they are involved
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = receiver_id
  );

-- Allow users to create connection requests (as requester)
CREATE POLICY "Users can create connection requests"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Allow users to update connections where they are the receiver (accepting requests)
CREATE POLICY "Users can update received connections"
  ON connections FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Allow users to delete connections where they are involved
CREATE POLICY "Users can delete their connections"
  ON connections FOR DELETE
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = receiver_id
  );