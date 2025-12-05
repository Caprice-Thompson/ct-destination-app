-- Create national_dish table
CREATE TABLE IF NOT EXISTS national_dish (
    id SERIAL PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    dish_name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country)
);

CREATE INDEX IF NOT EXISTS idx_national_dish_country ON national_dish(country);

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