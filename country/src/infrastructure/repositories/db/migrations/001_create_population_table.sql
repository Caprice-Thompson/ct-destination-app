-- Create city_populations table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_city_populations_country_name ON city_populations(country_name);
CREATE INDEX IF NOT EXISTS idx_city_populations_city_name ON city_populations(city_name);


