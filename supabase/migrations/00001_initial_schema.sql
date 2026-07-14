CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    white_model TEXT NOT NULL,
    black_model TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
    winner TEXT CHECK (winner IN ('white', 'black')),
    result_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ
);

CREATE TABLE moves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    ply_number INTEGER NOT NULL,
    player TEXT NOT NULL CHECK (player IN ('white', 'black')),
    notation TEXT NOT NULL,
    reasoning_text TEXT,
    latency_ms INTEGER NOT NULL,
    tokens_used INTEGER NOT NULL,
    was_illegal_attempt BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE model_stats (
    model_id TEXT PRIMARY KEY,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    avg_move_latency_ms FLOAT NOT NULL DEFAULT 0.0,
    avg_tokens FLOAT NOT NULL DEFAULT 0.0,
    illegal_move_rate FLOAT NOT NULL DEFAULT 0.0,
    rating INTEGER NOT NULL DEFAULT 1200
);

-- Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access for UI
CREATE POLICY "Public can read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public can read moves" ON moves FOR SELECT USING (true);
CREATE POLICY "Public can read model_stats" ON model_stats FOR SELECT USING (true);

-- Allow anonymous inserts for MVP (In production, use service_role key for backend writes)
CREATE POLICY "Public can insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update matches" ON matches FOR UPDATE USING (true);

CREATE POLICY "Public can insert moves" ON moves FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert model_stats" ON model_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update model_stats" ON model_stats FOR UPDATE USING (true);
