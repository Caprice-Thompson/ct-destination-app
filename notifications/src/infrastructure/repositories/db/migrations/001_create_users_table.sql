CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  last_notifications_checked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_last_notifications_checked_at
  ON users (last_notifications_checked_at);
