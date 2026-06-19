-- ============================================================
-- country: city_populations
-- ============================================================
CREATE TABLE IF NOT EXISTS city_populations (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    population INTEGER NOT NULL CHECK (population >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(city_name, country_name)
);

CREATE INDEX IF NOT EXISTS idx_city_populations_country_name ON city_populations(country_name);
CREATE INDEX IF NOT EXISTS idx_city_populations_city_name ON city_populations(city_name);

-- ============================================================
-- country: national_dish
-- ============================================================
CREATE TABLE IF NOT EXISTS national_dish (
    id SERIAL PRIMARY KEY,
    country_name VARCHAR(100) UNIQUE,
    country_code VARCHAR(4),
    dish_name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_name)
);

CREATE INDEX IF NOT EXISTS idx_national_dish_country_name ON national_dish(country_name);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_national_dish_updated_at
    BEFORE UPDATE ON national_dish
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- tourism: unesco_sites
-- ============================================================
CREATE TABLE IF NOT EXISTS unesco_sites (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    area_name VARCHAR(255) NOT NULL,
    site VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_unesco_sites_country_name ON unesco_sites(LOWER(country_name));

-- ============================================================
-- notifications: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    last_notifications_checked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_last_notifications_checked_at
    ON users (last_notifications_checked_at);
