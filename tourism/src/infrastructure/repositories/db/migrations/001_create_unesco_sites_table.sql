-- Create UNESCO Sites table for tourism information
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

COMMENT ON TABLE unesco_sites IS 'Stores UNESCO World Heritage Sites by country';

